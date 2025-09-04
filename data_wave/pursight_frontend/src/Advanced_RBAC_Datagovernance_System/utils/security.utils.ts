// Advanced RBAC Security Utilities - Enterprise-grade security functions
// Provides encryption, hashing, token management, and security monitoring capabilities

import type { 
  User, 
  Role, 
  Permission,
  RbacAuditLog
} from '../types';

import { rbacApiService } from '../services/rbac-api.service';

// ============================================================================
// SECURITY INTERFACES AND TYPES
// ============================================================================

export interface SecurityConfig {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  passwordMaxAge: number; // days
  sessionTimeout: number; // minutes
  maxFailedAttempts: number;
  lockoutDuration: number; // minutes
  mfaRequired: boolean;
  passwordHistoryCount: number;
}

export interface SecurityThreat {
  id: string;
  type: 'brute_force' | 'suspicious_activity' | 'privilege_escalation' | 'data_exfiltration' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  description: string;
  timestamp: string;
  mitigated: boolean;
  evidence: Record<string, any>;
}

export interface SecurityScore {
  overall: number;
  authentication: number;
  authorization: number;
  dataProtection: number;
  monitoring: number;
  compliance: number;
  recommendations: string[];
  risks: Array<{
    category: string;
    risk: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    likelihood: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
}

export interface EncryptionResult {
  encrypted: string;
  iv?: string;
  salt?: string;
  algorithm: string;
}

export interface TokenValidation {
  valid: boolean;
  expired: boolean;
  payload?: any;
  error?: string;
}

// ============================================================================
// CRYPTOGRAPHIC UTILITIES
// ============================================================================

/**
 * Generate cryptographically secure random string
 */
export function generateSecureRandom(
  length: number = 32,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => charset[byte % charset.length]).join('');
  } else {
    // Fallback for environments without crypto API
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }
}

/**
 * Generate secure password with specified criteria
 */
export function generateSecurePassword(options: {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSpecialChars?: boolean;
  excludeSimilar?: boolean;
} = {}): string {
  const {
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSpecialChars = true,
    excludeSimilar = true
  } = options;

  let charset = '';
  
  if (includeUppercase) {
    charset += excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  
  if (includeLowercase) {
    charset += excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
  }
  
  if (includeNumbers) {
    charset += excludeSimilar ? '23456789' : '0123456789';
  }
  
  if (includeSpecialChars) {
    charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }

  if (charset.length === 0) {
    throw new Error('At least one character type must be included');
  }

  let password = '';
  const array = new Uint8Array(length);
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
  }

  return password;
}

/**
 * Hash data using SHA-256 (client-side hashing for comparison)
 */
export async function hashData(data: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback simple hash (not cryptographically secure)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(
  password: string,
  config: Partial<SecurityConfig> = {}
): {
  score: number;
  strength: 'very_weak' | 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  passed: boolean;
} {
  const {
    passwordMinLength = 8,
    passwordRequireUppercase = true,
    passwordRequireLowercase = true,
    passwordRequireNumbers = true,
    passwordRequireSpecialChars = true
  } = config;

  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= passwordMinLength) {
    score += 25;
  } else {
    feedback.push(`Password must be at least ${passwordMinLength} characters long`);
  }

  // Character type checks
  if (passwordRequireUppercase && /[A-Z]/.test(password)) {
    score += 20;
  } else if (passwordRequireUppercase) {
    feedback.push('Password must contain at least one uppercase letter');
  }

  if (passwordRequireLowercase && /[a-z]/.test(password)) {
    score += 20;
  } else if (passwordRequireLowercase) {
    feedback.push('Password must contain at least one lowercase letter');
  }

  if (passwordRequireNumbers && /\d/.test(password)) {
    score += 20;
  } else if (passwordRequireNumbers) {
    feedback.push('Password must contain at least one number');
  }

  if (passwordRequireSpecialChars && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 15;
  } else if (passwordRequireSpecialChars) {
    feedback.push('Password must contain at least one special character');
  }

  // Additional strength checks
  if (password.length >= 12) {
    score += 10; // Bonus for longer passwords
  }

  if (!/(.)\1{2,}/.test(password)) {
    score += 5; // Bonus for no repeated characters
  } else {
    feedback.push('Avoid repeating the same character multiple times');
  }

  // Check for common patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    score -= 20;
    feedback.push('Avoid common password patterns');
  }

  // Determine strength level
  let strength: 'very_weak' | 'weak' | 'fair' | 'good' | 'strong';
  if (score < 30) {
    strength = 'very_weak';
  } else if (score < 50) {
    strength = 'weak';
  } else if (score < 70) {
    strength = 'fair';
  } else if (score < 90) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    strength,
    feedback,
    passed: feedback.length === 0
  };
}

// ============================================================================
// SESSION AND TOKEN MANAGEMENT
// ============================================================================

/**
 * Generate JWT-like token (client-side, for UI purposes only)
 */
export function generateToken(
  payload: Record<string, any>,
  expiresIn: number = 3600 // seconds
): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn
  };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/[+/]/g, (char) => 
    char === '+' ? '-' : '_'
  ).replace(/=/g, '');

  const encodedPayload = btoa(JSON.stringify(tokenPayload)).replace(/[+/]/g, (char) => 
    char === '+' ? '-' : '_'
  ).replace(/=/g, '');

  // Note: This is a mock signature for client-side use only
  // Real JWT signing should be done server-side
  const signature = btoa(`${encodedHeader}.${encodedPayload}.mock-signature`).replace(/[+/]/g, (char) => 
    char === '+' ? '-' : '_'
  ).replace(/=/g, '');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Validate token format and expiration (client-side validation)
 */
export function validateToken(token: string): TokenValidation {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, expired: false, error: 'Invalid token format' };
    }

    const payload = JSON.parse(atob(parts[1].replace(/[-_]/g, (char) => 
      char === '-' ? '+' : '/'
    )));

    const now = Math.floor(Date.now() / 1000);
    const expired = payload.exp && payload.exp < now;

    return {
      valid: !expired,
      expired,
      payload: expired ? undefined : payload,
      error: expired ? 'Token has expired' : undefined
    };
  } catch (error) {
    return { 
      valid: false, 
      expired: false, 
      error: 'Invalid token format' 
    };
  }
}

/**
 * Check if session is about to expire
 */
export function isSessionExpiringSoon(
  sessionStart: Date,
  sessionTimeout: number,
  warningMinutes: number = 5
): boolean {
  const now = new Date();
  const sessionEnd = new Date(sessionStart.getTime() + sessionTimeout * 60000);
  const warningTime = new Date(sessionEnd.getTime() - warningMinutes * 60000);
  
  return now >= warningTime && now < sessionEnd;
}

// ============================================================================
// SECURITY MONITORING AND THREAT DETECTION
// ============================================================================

/**
 * Detect suspicious login patterns
 */
export function detectSuspiciousActivity(
  auditLogs: RbacAuditLog[],
  timeWindowMinutes: number = 60
): SecurityThreat[] {
  const threats: SecurityThreat[] = [];
  const now = new Date();
  const windowStart = new Date(now.getTime() - timeWindowMinutes * 60000);

  // Filter recent logs
  const recentLogs = auditLogs.filter(log => 
    new Date(log.timestamp) >= windowStart
  );

  // Group by IP address
  const ipGroups = new Map<string, RbacAuditLog[]>();
  recentLogs.forEach(log => {
    if (log.actor_ip) {
      if (!ipGroups.has(log.actor_ip)) {
        ipGroups.set(log.actor_ip, []);
      }
      ipGroups.get(log.actor_ip)!.push(log);
    }
  });

  // Check for brute force attacks
  ipGroups.forEach((logs, ip) => {
    const failedLogins = logs.filter(log => 
      log.action === 'failed_login'
    );

    if (failedLogins.length >= 5) {
      threats.push({
        id: generateSecureRandom(16),
        type: 'brute_force',
        severity: failedLogins.length >= 10 ? 'high' : 'medium',
        ipAddress: ip,
        description: `${failedLogins.length} failed login attempts from IP ${ip}`,
        timestamp: now.toISOString(),
        mitigated: false,
        evidence: {
          failedAttempts: failedLogins.length,
          timeWindow: timeWindowMinutes,
          attempts: failedLogins.map(log => ({
            timestamp: log.timestamp,
            targetUser: log.target_user
          }))
        }
      });
    }
  });

  // Check for privilege escalation
  const privilegeChanges = recentLogs.filter(log => 
    log.action === 'assign_role' || log.action === 'update_user'
  );

  const privilegeEscalations = new Map<string, number>();
  privilegeChanges.forEach(log => {
    const key = `${log.performed_by}-${log.target_user}`;
    privilegeEscalations.set(key, (privilegeEscalations.get(key) || 0) + 1);
  });

  privilegeEscalations.forEach((count, key) => {
    if (count >= 3) {
      const [performer, target] = key.split('-');
      threats.push({
        id: generateSecureRandom(16),
        type: 'privilege_escalation',
        severity: 'high',
        description: `Potential privilege escalation: ${performer} made ${count} privilege changes to ${target}`,
        timestamp: now.toISOString(),
        mitigated: false,
        evidence: {
          performer,
          target,
          changeCount: count,
          timeWindow: timeWindowMinutes
        }
      });
    }
  });

  return threats;
}

/**
 * Calculate security score for user
 */
export async function calculateUserSecurityScore(user: User): Promise<SecurityScore> {
  let authScore = 0;
  let authorizationScore = 0;
  let dataProtectionScore = 0;
  const recommendations: string[] = [];
  const risks: SecurityScore['risks'] = [];

  // Authentication score
  if (user.mfa_enabled) {
    authScore += 40;
  } else {
    recommendations.push('Enable multi-factor authentication');
    risks.push({
      category: 'Authentication',
      risk: 'No MFA enabled',
      impact: 'high',
      likelihood: 'medium',
      mitigation: 'Enable MFA for enhanced security'
    });
  }

  if (user.is_verified) {
    authScore += 20;
  } else {
    recommendations.push('Verify email address');
    risks.push({
      category: 'Authentication',
      risk: 'Unverified email',
      impact: 'medium',
      likelihood: 'low',
      mitigation: 'Complete email verification'
    });
  }

  // Check last login recency
  if (user.last_login) {
    const daysSinceLogin = (Date.now() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLogin <= 30) {
      authScore += 20;
    } else if (daysSinceLogin > 90) {
      recommendations.push('Account appears inactive - consider review');
      risks.push({
        category: 'Authentication',
        risk: 'Inactive account',
        impact: 'low',
        likelihood: 'medium',
        mitigation: 'Regular account review and cleanup'
      });
    }
  }

  if (user.is_active) {
    authScore += 20;
  }

  // Authorization score
  if (user.role) {
    authorizationScore += 30;
    
    // Check for over-privileged accounts
    if (user.role === 'admin') {
      recommendations.push('Review admin privileges regularly');
      risks.push({
        category: 'Authorization',
        risk: 'High privilege account',
        impact: 'critical',
        likelihood: 'low',
        mitigation: 'Regular privilege review and principle of least privilege'
      });
      authorizationScore += 20; // Admin accounts need extra monitoring
    } else {
      authorizationScore += 30;
    }
  }

  // Data protection score
  if (user.department && user.region) {
    dataProtectionScore += 30; // Proper data classification
  } else {
    recommendations.push('Complete user profile for better data governance');
  }

  dataProtectionScore += 40; // Base score for having user data

  // Check for sensitive data exposure
  if (user.phone_number || user.birthday) {
    dataProtectionScore += 15;
    recommendations.push('Ensure PII is properly protected');
  }

  dataProtectionScore += 15; // Email protection

  // Overall calculations
  const monitoring = 80; // Assume good monitoring is in place
  const compliance = 75; // Base compliance score

  const overall = Math.round(
    (authScore + authorizationScore + dataProtectionScore + monitoring + compliance) / 5
  );

  return {
    overall,
    authentication: authScore,
    authorization: authorizationScore,
    dataProtection: dataProtectionScore,
    monitoring,
    compliance,
    recommendations,
    risks
  };
}

/**
 * Check for security policy violations
 */
export function checkSecurityPolicyViolations(
  user: User,
  config: SecurityConfig
): Array<{
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
}> {
  const violations = [];

  // Check MFA requirement
  if (config.mfaRequired && !user.mfa_enabled) {
    violations.push({
      type: 'mfa_not_enabled',
      severity: 'high' as const,
      description: 'Multi-factor authentication is required but not enabled',
      remediation: 'Enable MFA for this user account'
    });
  }

  // Check password age (if we had password change date)
  // This would require additional user fields in the backend

  // Check for inactive accounts
  if (user.last_login) {
    const daysSinceLogin = (Date.now() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLogin > 90) {
      violations.push({
        type: 'inactive_account',
        severity: 'medium' as const,
        description: `Account has been inactive for ${Math.round(daysSinceLogin)} days`,
        remediation: 'Review account necessity and consider deactivation'
      });
    }
  }

  // Check unverified accounts
  if (user.is_active && !user.is_verified) {
    violations.push({
      type: 'unverified_active_account',
      severity: 'medium' as const,
      description: 'Active account with unverified email address',
      remediation: 'Complete email verification or deactivate account'
    });
  }

  return violations;
}

// ============================================================================
// SECURITY UTILITIES FOR UI
// ============================================================================

/**
 * Mask sensitive data for display
 */
export function maskSensitiveData(
  data: string,
  type: 'email' | 'phone' | 'ssn' | 'credit_card' | 'custom',
  options: {
    showFirst?: number;
    showLast?: number;
    maskChar?: string;
  } = {}
): string {
  const { showFirst = 2, showLast = 2, maskChar = '*' } = options;

  if (!data) return '';

  switch (type) {
    case 'email':
      const [local, domain] = data.split('@');
      if (local && domain) {
        const maskedLocal = local.length > 2 
          ? local[0] + maskChar.repeat(local.length - 2) + local[local.length - 1]
          : maskChar.repeat(local.length);
        return `${maskedLocal}@${domain}`;
      }
      return data;

    case 'phone':
      if (data.length >= 10) {
        return data.slice(0, 3) + maskChar.repeat(data.length - 6) + data.slice(-3);
      }
      return maskChar.repeat(data.length);

    case 'ssn':
      if (data.length === 11 && data.includes('-')) {
        return `${maskChar.repeat(3)}-${maskChar.repeat(2)}-${data.slice(-4)}`;
      }
      if (data.length === 9) {
        return maskChar.repeat(5) + data.slice(-4);
      }
      return maskChar.repeat(data.length);

    case 'credit_card':
      if (data.length >= 13) {
        return maskChar.repeat(data.length - 4) + data.slice(-4);
      }
      return maskChar.repeat(data.length);

    case 'custom':
    default:
      if (data.length <= showFirst + showLast) {
        return maskChar.repeat(data.length);
      }
      return data.slice(0, showFirst) + 
             maskChar.repeat(data.length - showFirst - showLast) + 
             data.slice(-showLast);
  }
}

/**
 * Generate security headers for API requests
 */
export function generateSecurityHeaders(
  options: {
    includeCSRF?: boolean;
    includeCorrelationId?: boolean;
    includeTimestamp?: boolean;
  } = {}
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (options.includeCSRF) {
    headers['X-CSRF-Token'] = generateSecureRandom(32);
  }

  if (options.includeCorrelationId) {
    headers['X-Correlation-ID'] = generateSecureRandom(16);
  }

  if (options.includeTimestamp) {
    headers['X-Timestamp'] = new Date().toISOString();
  }

  // Security headers
  headers['X-Content-Type-Options'] = 'nosniff';
  headers['X-Frame-Options'] = 'DENY';
  headers['X-XSS-Protection'] = '1; mode=block';

  return headers;
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }

    // Block localhost and private IP ranges in production
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname === 'localhost' || 
        hostname.startsWith('127.') || 
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        (hostname.startsWith('172.') && 
         parseInt(hostname.split('.')[1]) >= 16 && 
         parseInt(hostname.split('.')[1]) <= 31)) {
      return null;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

// ============================================================================
// SECURITY MONITORING INTEGRATION
// ============================================================================

/**
 * Log security event
 */
export async function logSecurityEvent(
  eventType: 'authentication' | 'authorization' | 'data_access' | 'configuration_change' | 'suspicious_activity',
  details: {
    userId?: number;
    action: string;
    resource?: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  try {
    await rbacApiService.post('/rbac/security/log-event', {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      ...details
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Report security incident
 */
export async function reportSecurityIncident(
  incident: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedUsers?: number[];
    evidence?: Record<string, any>;
    detectedBy: string;
  }
): Promise<{ incidentId: string; acknowledged: boolean }> {
  try {
    const response = await rbacApiService.post<{ incident_id: string; acknowledged: boolean }>(
      '/rbac/security/report-incident',
      {
        ...incident,
        timestamp: new Date().toISOString(),
        correlation_id: generateSecureRandom(16)
      }
    );

    return {
      incidentId: response.data.incident_id,
      acknowledged: response.data.acknowledged
    };
  } catch (error) {
    console.error('Failed to report security incident:', error);
    return {
      incidentId: generateSecureRandom(16),
      acknowledged: false
    };
  }
}

export default {
  generateSecureRandom,
  generateSecurePassword,
  hashData,
  validatePasswordStrength,
  generateToken,
  validateToken,
  isSessionExpiringSoon,
  detectSuspiciousActivity,
  calculateUserSecurityScore,
  checkSecurityPolicyViolations,
  maskSensitiveData,
  generateSecurityHeaders,
  sanitizeInput,
  sanitizeUrl,
  logSecurityEvent,
  reportSecurityIncident
};