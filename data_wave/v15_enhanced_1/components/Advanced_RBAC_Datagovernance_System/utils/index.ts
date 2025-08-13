// Advanced RBAC Utils Index - Export all utility functions
// Centralized export for all RBAC utility modules

// Core RBAC utilities
export * from './rbac.utils';
export { default as rbacUtils } from './rbac.utils';

// Permission management utilities
export * from './permission.utils';
export { default as permissionUtils } from './permission.utils';

// Validation utilities
export * from './validation.utils';
export { default as validationUtils } from './validation.utils';

// Formatting utilities
export * from './format.utils';
export { default as formatUtils } from './format.utils';

// Export/Import utilities
export * from './export.utils';
export { default as exportUtils } from './export.utils';

// Security utilities
export * from './security.utils';
export { default as securityUtils } from './security.utils';

// Convenience re-exports for commonly used functions
export {
  // RBAC Core
  hasPermission,
  hasPermissions,
  getUserEffectivePermissions,
  hasAnyRole,
  hasAllRoles,
  buildResourceTree,
  logRbacAction,
  generateCorrelationId,
  bulkAssignRoleToUsers,
  bulkRemoveRoleFromUsers,
  validatePermissionAction,
  validatePermissionResource,
  validateRoleName,
  isSystemAdmin,
  canManageRBAC,
  getUserDisplayName,
  getRoleColor
} from './rbac.utils';

export {
  // Permission Management
  createPermission,
  updatePermission,
  deletePermission,
  listPermissions,
  assignPermissionToRole,
  removePermissionFromRole,
  validatePermission,
  validatePermissionConditions,
  getPermissionUsage,
  getPermissionStats,
  comparePermissions,
  exportPermissionsToCsv,
  exportPermissionMatrixToExcel
} from './permission.utils';

export {
  // Validation
  validateUserEmail,
  validateUserPassword,
  validateUserProfile,
  validateRoleName as validateRoleNameWithUniqueness,
  validateRoleHierarchy,
  validateResourceHierarchy,
  validateAccessRequest,
  validateSecurityConfiguration,
  validateBulkEntities
} from './validation.utils';

export {
  // Formatting
  formatDate,
  formatRelativeTime,
  formatUserName,
  formatUserEmail,
  formatUserStatus,
  formatRoleName,
  formatPermission,
  formatPermissionConditions,
  formatResourcePath,
  formatResourceType,
  formatAuditAction,
  formatAuditTarget,
  formatAccessRequestStatus,
  formatNumber,
  formatPercentage,
  capitalizeFirst,
  toTitleCase,
  truncateText,
  highlightSearchTerms,
  formatPermissionMatrix,
  formatEffectivePermissions,
  formatJsonForDisplay
} from './format.utils';

export {
  // Export/Import
  exportUsersToCSV,
  exportRolesToCSV,
  exportPermissionsToCSV,
  exportAuditLogsToCSV,
  exportToJSON,
  exportToExcelCSV,
  exportToXML,
  downloadFile,
  getMimeType,
  generateFilename,
  parseCSV,
  importUsersFromCSV,
  importFromJSON,
  exportRBACData,
  importRBACData
} from './export.utils';

export {
  // Security
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
} from './security.utils';

// Type exports
export type {
  ValidationResult,
  FieldValidationResult,
  EntityValidationResult,
  SecurityValidationResult
} from './validation.utils';

export type {
  ExportFormat,
  ExportOptions,
  ImportOptions,
  ExportResult,
  ImportResult
} from './export.utils';

export type {
  SecurityConfig,
  SecurityThreat,
  SecurityScore,
  EncryptionResult,
  TokenValidation
} from './security.utils';