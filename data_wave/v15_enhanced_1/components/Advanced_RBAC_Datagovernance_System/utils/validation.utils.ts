// Advanced RBAC Validation Utilities - Enterprise-grade validation functions
// Maps to: backend validation logic across auth_service.py, role_service.py, rbac_service.py

import type { 
  User, 
  Role, 
  Permission, 
  Resource, 
  Group,
  PermissionCreate,
  PermissionUpdate,
  AccessRequest
} from '../types';

import { rbacApiService } from '../services/rbac-api.service';

// ============================================================================
// VALIDATION RESULT INTERFACES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface FieldValidationResult {
  field: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface EntityValidationResult extends ValidationResult {
  entity_type: string;
  entity_id?: string | number;
  field_validations: FieldValidationResult[];
}

export interface SecurityValidationResult extends ValidationResult {
  security_level: 'low' | 'medium' | 'high' | 'critical';
  compliance_issues: string[];
  security_recommendations: string[];
}

// ============================================================================
// USER VALIDATION
// ============================================================================

/**
 * Validate user email format and uniqueness
 */
export async function validateUserEmail(
  email: string, 
  excludeUserId?: number
): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Format validation
  if (!email || email.trim().length === 0) {
    result.valid = false;
    result.errors.push('Email is required');
    return result;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    result.valid = false;
    result.errors.push('Invalid email format');
    return result;
  }

  // Length validation
  if (email.length > 255) {
    result.valid = false;
    result.errors.push('Email cannot exceed 255 characters');
  }

  // Domain validation (basic)
  const domain = email.split('@')[1];
  if (domain.length < 3) {
    result.valid = false;
    result.errors.push('Invalid email domain');
  }

  // Check uniqueness via backend
  try {
    const response = await rbacApiService.post<{ exists: boolean; suggestions?: string[] }>(
      '/rbac/users/validate-email', 
      { 
        email, 
        exclude_user_id: excludeUserId 
      }
    );

    if (response.data.exists) {
      result.valid = false;
      result.errors.push('Email address is already in use');
      
      if (response.data.suggestions) {
        result.suggestions.push(...response.data.suggestions);
      }
    }
  } catch (error) {
    result.warnings.push('Could not verify email uniqueness');
  }

  return result;
}

/**
 * Validate user password strength
 */
export function validateUserPassword(password: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (!password) {
    result.valid = false;
    result.errors.push('Password is required');
    return result;
  }

  // Length validation
  if (password.length < 8) {
    result.valid = false;
    result.errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    result.valid = false;
    result.errors.push('Password cannot exceed 128 characters');
  }

  // Complexity validation
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasLowercase) {
    result.errors.push('Password must contain at least one lowercase letter');
    result.valid = false;
  }

  if (!hasUppercase) {
    result.errors.push('Password must contain at least one uppercase letter');
    result.valid = false;
  }

  if (!hasNumbers) {
    result.errors.push('Password must contain at least one number');
    result.valid = false;
  }

  if (!hasSpecialChars) {
    result.warnings.push('Password should contain at least one special character');
    result.suggestions.push('Consider adding special characters (!@#$%^&*) for better security');
  }

  // Common password patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      result.valid = false;
      result.errors.push('Password contains common patterns that are easily guessed');
      break;
    }
  }

  // Sequential characters
  if (/(.)\1{2,}/.test(password)) {
    result.warnings.push('Password contains repeated characters');
    result.suggestions.push('Avoid using repeated characters for better security');
  }

  return result;
}

/**
 * Validate user profile data
 */
export function validateUserProfile(userData: Partial<User>): EntityValidationResult {
  const result: EntityValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: [],
    entity_type: 'user',
    entity_id: userData.id,
    field_validations: []
  };

  // First name validation
  if (userData.first_name !== undefined) {
    const firstNameValidation = validateName(userData.first_name, 'First name');
    result.field_validations.push({
      field: 'first_name',
      ...firstNameValidation
    });
    
    if (!firstNameValidation.valid) {
      result.valid = false;
      result.errors.push(...firstNameValidation.errors);
    }
  }

  // Last name validation
  if (userData.last_name !== undefined) {
    const lastNameValidation = validateName(userData.last_name, 'Last name');
    result.field_validations.push({
      field: 'last_name',
      ...lastNameValidation
    });
    
    if (!lastNameValidation.valid) {
      result.valid = false;
      result.errors.push(...lastNameValidation.errors);
    }
  }

  // Phone number validation
  if (userData.phone_number) {
    const phoneValidation = validatePhoneNumber(userData.phone_number);
    result.field_validations.push({
      field: 'phone_number',
      ...phoneValidation
    });
    
    if (!phoneValidation.valid) {
      result.valid = false;
      result.errors.push(...phoneValidation.errors);
    }
  }

  // Department validation
  if (userData.department) {
    const deptValidation = validateDepartment(userData.department);
    result.field_validations.push({
      field: 'department',
      ...deptValidation
    });
    
    if (!deptValidation.valid) {
      result.valid = false;
      result.errors.push(...deptValidation.errors);
    }
  }

  // Region validation
  if (userData.region) {
    const regionValidation = validateRegion(userData.region);
    result.field_validations.push({
      field: 'region',
      ...regionValidation
    });
    
    if (!regionValidation.valid) {
      result.valid = false;
      result.errors.push(...regionValidation.errors);
    }
  }

  return result;
}

// ============================================================================
// ROLE VALIDATION
// ============================================================================

/**
 * Validate role name format and uniqueness
 */
export async function validateRoleName(
  name: string, 
  excludeRoleId?: number
): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Basic format validation
  if (!name || name.trim().length === 0) {
    result.valid = false;
    result.errors.push('Role name is required');
    return result;
  }

  if (name.length < 3) {
    result.valid = false;
    result.errors.push('Role name must be at least 3 characters long');
  }

  if (name.length > 50) {
    result.valid = false;
    result.errors.push('Role name cannot exceed 50 characters');
  }

  // Character validation
  if (!/^[a-zA-Z][a-zA-Z0-9_\-\s]*$/.test(name)) {
    result.valid = false;
    result.errors.push('Role name can only contain letters, numbers, underscores, hyphens, and spaces');
  }

  // Reserved names
  const reservedNames = [
    'admin', 'administrator', 'root', 'system', 'guest', 'anonymous',
    'public', 'private', 'null', 'undefined', 'default'
  ];

  if (reservedNames.includes(name.toLowerCase())) {
    result.valid = false;
    result.errors.push('Role name is reserved and cannot be used');
  }

  // Check uniqueness
  try {
    const response = await rbacApiService.post<{ exists: boolean; suggestions?: string[] }>(
      '/rbac/roles/validate-name', 
      { 
        name, 
        exclude_role_id: excludeRoleId 
      }
    );

    if (response.data.exists) {
      result.valid = false;
      result.errors.push('Role name already exists');
      
      if (response.data.suggestions) {
        result.suggestions.push(...response.data.suggestions);
      }
    }
  } catch (error) {
    result.warnings.push('Could not verify role name uniqueness');
  }

  return result;
}

/**
 * Validate role hierarchy to prevent cycles
 */
export async function validateRoleHierarchy(
  childRoleId: number,
  parentRoleId: number
): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (childRoleId === parentRoleId) {
    result.valid = false;
    result.errors.push('A role cannot be its own parent');
    return result;
  }

  try {
    const response = await rbacApiService.post<{ 
      can_assign: boolean; 
      cycle_detected?: boolean;
      cycle_path?: string[];
    }>('/rbac/roles/validate-hierarchy', {
      child_role_id: childRoleId,
      parent_role_id: parentRoleId
    });

    if (!response.data.can_assign) {
      result.valid = false;
      
      if (response.data.cycle_detected) {
        result.errors.push('Role hierarchy would create a circular dependency');
        
        if (response.data.cycle_path) {
          result.errors.push(`Cycle path: ${response.data.cycle_path.join(' → ')}`);
        }
      } else {
        result.errors.push('Invalid role hierarchy assignment');
      }
    }
  } catch (error) {
    result.valid = false;
    result.errors.push('Could not validate role hierarchy');
  }

  return result;
}

// ============================================================================
// PERMISSION VALIDATION
// ============================================================================

/**
 * Validate permission action format
 */
export function validatePermissionAction(action: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (!action || action.trim().length === 0) {
    result.valid = false;
    result.errors.push('Permission action is required');
    return result;
  }

  if (action.length > 100) {
    result.valid = false;
    result.errors.push('Permission action cannot exceed 100 characters');
  }

  // Format validation: module.action (e.g., scan.view, data.edit)
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/.test(action)) {
    result.valid = false;
    result.errors.push('Action must follow format: module.action (e.g., scan.view, data.edit)');
    result.suggestions.push('Use lowercase letters, numbers, and underscores separated by dots');
  }

  // Check for common typos
  const commonActions = ['view', 'create', 'edit', 'delete', 'manage', 'export', 'import'];
  const actionPart = action.split('.').pop();
  
  if (actionPart && !commonActions.includes(actionPart)) {
    const suggestions = commonActions.filter(ca => 
      ca.includes(actionPart) || actionPart.includes(ca)
    );
    
    if (suggestions.length > 0) {
      result.suggestions.push(`Did you mean: ${suggestions.join(', ')}?`);
    }
  }

  return result;
}

/**
 * Validate permission resource format
 */
export function validatePermissionResource(resource: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (!resource || resource.trim().length === 0) {
    result.valid = false;
    result.errors.push('Permission resource is required');
    return result;
  }

  if (resource.length > 200) {
    result.valid = false;
    result.errors.push('Permission resource cannot exceed 200 characters');
  }

  // Format validation: module.resource or module.resource.* (e.g., datasource.mysql, scan.*)
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*(\*)?$/.test(resource)) {
    result.valid = false;
    result.errors.push('Resource must follow format: module.resource (e.g., datasource.mysql, scan.*)');
    result.suggestions.push('Use lowercase letters, numbers, underscores separated by dots, optional * wildcard at end');
  }

  // Wildcard validation
  if (resource.includes('*') && !resource.endsWith('*')) {
    result.valid = false;
    result.errors.push('Wildcard (*) can only be used at the end of the resource');
  }

  return result;
}

/**
 * Validate permission conditions (ABAC)
 */
export function validatePermissionConditions(conditions: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (!conditions || conditions.trim().length === 0) {
    return result; // Conditions are optional
  }

  try {
    const parsed = JSON.parse(conditions);
    
    if (typeof parsed !== 'object' || parsed === null) {
      result.valid = false;
      result.errors.push('Conditions must be a JSON object');
      return result;
    }

    // Validate condition structure
    for (const [key, value] of Object.entries(parsed)) {
      // Key validation
      if (typeof key !== 'string' || key.trim().length === 0) {
        result.valid = false;
        result.errors.push('Condition keys must be non-empty strings');
        continue;
      }

      // Value validation
      if (typeof value === 'object' && value !== null && '$op' in value) {
        // Operator-based condition
        const { $op: op, value: operand } = value as any;
        
        const validOps = ['eq', 'ne', 'in', 'not_in', 'gt', 'gte', 'lt', 'lte', 'regex', 'user_attr'];
        if (!validOps.includes(op)) {
          result.valid = false;
          result.errors.push(`Invalid operator: ${op}. Valid operators: ${validOps.join(', ')}`);
        }

        // Validate operand based on operator
        if (['in', 'not_in'].includes(op) && !Array.isArray(operand)) {
          result.valid = false;
          result.errors.push(`Operator '${op}' requires an array operand`);
        }

        if (['gt', 'gte', 'lt', 'lte'].includes(op) && typeof operand !== 'number') {
          result.valid = false;
          result.errors.push(`Operator '${op}' requires a numeric operand`);
        }

        if (op === 'regex') {
          try {
            new RegExp(operand);
          } catch {
            result.valid = false;
            result.errors.push(`Invalid regex pattern: ${operand}`);
          }
        }
      } else if (Array.isArray(value)) {
        // Array value (implicit 'in' operation)
        if (value.length === 0) {
          result.warnings.push(`Condition '${key}' has empty array value`);
        }
      } else if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
        result.valid = false;
        result.errors.push(`Invalid condition value type for '${key}'. Must be string, number, boolean, array, or operator object`);
      }
    }

    // Security validation
    const sensitiveFields = ['password', 'secret', 'token', 'key'];
    for (const field of sensitiveFields) {
      if (key.toLowerCase().includes(field)) {
        result.warnings.push(`Condition uses potentially sensitive field: ${key}`);
        result.suggestions.push('Avoid using sensitive data in permission conditions');
      }
    }

  } catch (error) {
    result.valid = false;
    result.errors.push('Invalid JSON format in conditions');
    result.suggestions.push('Ensure conditions are valid JSON');
  }

  return result;
}

// ============================================================================
// RESOURCE VALIDATION
// ============================================================================

/**
 * Validate resource hierarchy
 */
export async function validateResourceHierarchy(
  resourceId: number,
  parentId?: number
): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (parentId && resourceId === parentId) {
    result.valid = false;
    result.errors.push('A resource cannot be its own parent');
    return result;
  }

  if (parentId) {
    try {
      const response = await rbacApiService.post<{ 
        can_assign: boolean; 
        cycle_detected?: boolean;
        max_depth_exceeded?: boolean;
      }>('/rbac/resources/validate-hierarchy', {
        resource_id: resourceId,
        parent_id: parentId
      });

      if (!response.data.can_assign) {
        result.valid = false;
        
        if (response.data.cycle_detected) {
          result.errors.push('Resource hierarchy would create a circular dependency');
        }
        
        if (response.data.max_depth_exceeded) {
          result.errors.push('Resource hierarchy exceeds maximum allowed depth');
        }
      }
    } catch (error) {
      result.valid = false;
      result.errors.push('Could not validate resource hierarchy');
    }
  }

  return result;
}

// ============================================================================
// ACCESS REQUEST VALIDATION
// ============================================================================

/**
 * Validate access request
 */
export function validateAccessRequest(request: Partial<AccessRequest>): EntityValidationResult {
  const result: EntityValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: [],
    entity_type: 'access_request',
    entity_id: request.id,
    field_validations: []
  };

  // User ID validation
  if (!request.user_id) {
    result.valid = false;
    result.errors.push('User ID is required');
  }

  // Resource type validation
  if (!request.resource_type || request.resource_type.trim().length === 0) {
    result.valid = false;
    result.errors.push('Resource type is required');
  } else if (request.resource_type.length > 50) {
    result.valid = false;
    result.errors.push('Resource type cannot exceed 50 characters');
  }

  // Resource ID validation
  if (!request.resource_id || request.resource_id.trim().length === 0) {
    result.valid = false;
    result.errors.push('Resource ID is required');
  } else if (request.resource_id.length > 100) {
    result.valid = false;
    result.errors.push('Resource ID cannot exceed 100 characters');
  }

  // Requested role validation
  if (!request.requested_role || request.requested_role.trim().length === 0) {
    result.valid = false;
    result.errors.push('Requested role is required');
  }

  // Justification validation
  if (!request.justification || request.justification.trim().length === 0) {
    result.valid = false;
    result.errors.push('Justification is required');
  } else {
    if (request.justification.length < 10) {
      result.warnings.push('Justification is quite short');
      result.suggestions.push('Provide more detailed justification for better approval chances');
    }
    
    if (request.justification.length > 1000) {
      result.valid = false;
      result.errors.push('Justification cannot exceed 1000 characters');
    }
  }

  return result;
}

// ============================================================================
// SECURITY VALIDATION
// ============================================================================

/**
 * Validate security configuration
 */
export async function validateSecurityConfiguration(
  userId: number
): Promise<SecurityValidationResult> {
  const result: SecurityValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: [],
    security_level: 'medium',
    compliance_issues: [],
    security_recommendations: []
  };

  try {
    const response = await rbacApiService.get<{
      security_score: number;
      issues: Array<{
        type: 'error' | 'warning' | 'info';
        message: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
      }>;
      recommendations: string[];
    }>(`/rbac/users/${userId}/security-validation`);

    const { security_score, issues, recommendations } = response.data;

    // Determine security level based on score
    if (security_score >= 90) {
      result.security_level = 'low';
    } else if (security_score >= 70) {
      result.security_level = 'medium';
    } else if (security_score >= 50) {
      result.security_level = 'high';
    } else {
      result.security_level = 'critical';
    }

    // Process issues
    issues.forEach(issue => {
      switch (issue.type) {
        case 'error':
          result.valid = false;
          result.errors.push(issue.message);
          if (issue.severity === 'critical' || issue.severity === 'high') {
            result.compliance_issues.push(issue.message);
          }
          break;
        case 'warning':
          result.warnings.push(issue.message);
          break;
        default:
          result.suggestions.push(issue.message);
      }
    });

    result.security_recommendations.push(...recommendations);

  } catch (error) {
    result.warnings.push('Could not perform complete security validation');
  }

  return result;
}

// ============================================================================
// HELPER VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate name fields
 */
function validateName(name: string, fieldName: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (name && name.trim().length === 0) {
    result.valid = false;
    result.errors.push(`${fieldName} cannot be empty`);
    return result;
  }

  if (name && name.length > 50) {
    result.valid = false;
    result.errors.push(`${fieldName} cannot exceed 50 characters`);
  }

  if (name && !/^[a-zA-Z\s\-'\.]*$/.test(name)) {
    result.valid = false;
    result.errors.push(`${fieldName} can only contain letters, spaces, hyphens, apostrophes, and periods`);
  }

  return result;
}

/**
 * Validate phone number
 */
function validatePhoneNumber(phone: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (phone.length > 20) {
    result.valid = false;
    result.errors.push('Phone number cannot exceed 20 characters');
  }

  // Basic international phone format
  if (!/^\+?[\d\s\-\(\)\.]+$/.test(phone)) {
    result.valid = false;
    result.errors.push('Invalid phone number format');
    result.suggestions.push('Use international format: +1-234-567-8900');
  }

  return result;
}

/**
 * Validate department
 */
function validateDepartment(department: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (department.length > 100) {
    result.valid = false;
    result.errors.push('Department name cannot exceed 100 characters');
  }

  const validDepartments = [
    'IT', 'Finance', 'HR', 'Marketing', 'Sales', 'Operations', 
    'Legal', 'Compliance', 'Security', 'Data', 'Analytics'
  ];

  if (!validDepartments.some(dept => 
    dept.toLowerCase() === department.toLowerCase()
  )) {
    result.suggestions.push(`Consider using standard department names: ${validDepartments.join(', ')}`);
  }

  return result;
}

/**
 * Validate region
 */
function validateRegion(region: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (region.length > 50) {
    result.valid = false;
    result.errors.push('Region cannot exceed 50 characters');
  }

  const validRegions = [
    'US', 'EU', 'APAC', 'EMEA', 'LATAM', 'Canada', 'UK', 'Australia'
  ];

  if (!validRegions.some(r => r.toLowerCase() === region.toLowerCase())) {
    result.suggestions.push(`Consider using standard region codes: ${validRegions.join(', ')}`);
  }

  return result;
}

// ============================================================================
// BULK VALIDATION
// ============================================================================

/**
 * Validate multiple entities at once
 */
export async function validateBulkEntities<T>(
  entities: T[],
  validator: (entity: T) => Promise<ValidationResult> | ValidationResult
): Promise<{
  valid: boolean;
  results: Array<ValidationResult & { index: number; entity: T }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    warnings: number;
  };
}> {
  const results = [];
  let validCount = 0;
  let invalidCount = 0;
  let warningCount = 0;

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const validationResult = await validator(entity);
    
    results.push({
      ...validationResult,
      index: i,
      entity
    });

    if (validationResult.valid) {
      validCount++;
    } else {
      invalidCount++;
    }

    if (validationResult.warnings.length > 0) {
      warningCount++;
    }
  }

  return {
    valid: invalidCount === 0,
    results,
    summary: {
      total: entities.length,
      valid: validCount,
      invalid: invalidCount,
      warnings: warningCount
    }
  };
}

export default {
  validateUserEmail,
  validateUserPassword,
  validateUserProfile,
  validateRoleName,
  validateRoleHierarchy,
  validatePermissionAction,
  validatePermissionResource,
  validatePermissionConditions,
  validateResourceHierarchy,
  validateAccessRequest,
  validateSecurityConfiguration,
  validateBulkEntities
};