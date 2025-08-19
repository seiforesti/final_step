// ============================================================================
// VALIDATORS UTILITY - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Validation utilities for the Advanced Catalog components
// ============================================================================

import { z } from 'zod';

// ============================================================================
// BASIC VALIDATORS
// ============================================================================

/**
 * Validate email address
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true };
}

/**
 * Validate URL
 */
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  if (!url) {
    return { isValid: false, error: 'URL is required' };
  }
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string = 'Field'): { isValid: boolean; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, error: `${fieldName} cannot be empty` };
  }
  
  return { isValid: true };
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min: number = 0,
  max: number = Infinity,
  fieldName: string = 'Field'
): { isValid: boolean; error?: string } {
  if (!value) value = '';
  
  if (value.length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters` };
  }
  
  if (value.length > max) {
    return { isValid: false, error: `${fieldName} must be no more than ${max} characters` };
  }
  
  return { isValid: true };
}

/**
 * Validate number range
 */
export function validateNumberRange(
  value: number,
  min: number = -Infinity,
  max: number = Infinity,
  fieldName: string = 'Number'
): { isValid: boolean; error?: string } {
  if (isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  
  if (value < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }
  
  if (value > max) {
    return { isValid: false, error: `${fieldName} must be no more than ${max}` };
  }
  
  return { isValid: true };
}

// ============================================================================
// CATALOG-SPECIFIC VALIDATORS
// ============================================================================

/**
 * Validate asset name
 */
export function validateAssetName(name: string): { isValid: boolean; error?: string } {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Asset name is required' };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: 'Asset name must be at least 2 characters' };
  }
  
  if (name.length > 255) {
    return { isValid: false, error: 'Asset name must be no more than 255 characters' };
  }
  
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (invalidChars.test(name)) {
    return { isValid: false, error: 'Asset name contains invalid characters' };
  }
  
  return { isValid: true };
}

/**
 * Validate data source connection string
 */
export function validateConnectionString(connectionString: string): { isValid: boolean; error?: string } {
  if (!connectionString || connectionString.trim() === '') {
    return { isValid: false, error: 'Connection string is required' };
  }
  
  // Basic validation for common connection string patterns
  const patterns = [
    /^jdbc:/i,
    /^postgresql:/i,
    /^mysql:/i,
    /^mongodb:/i,
    /^redis:/i,
    /^elasticsearch:/i,
    /^snowflake:/i,
    /^databricks:/i
  ];
  
  const isValidPattern = patterns.some(pattern => pattern.test(connectionString));
  
  if (!isValidPattern) {
    return { isValid: false, error: 'Invalid connection string format' };
  }
  
  return { isValid: true };
}

/**
 * Validate cron expression
 */
export function validateCronExpression(cronExpression: string): { isValid: boolean; error?: string } {
  if (!cronExpression || cronExpression.trim() === '') {
    return { isValid: false, error: 'Cron expression is required' };
  }
  
  const parts = cronExpression.trim().split(/\s+/);
  
  if (parts.length !== 5 && parts.length !== 6) {
    return { isValid: false, error: 'Cron expression must have 5 or 6 parts' };
  }
  
  // Basic validation - more comprehensive validation would require a full cron parser
  const validPart = /^(\*|(\d+(-\d+)?(,\d+(-\d+)?)*)|(\d+\/\d+))$/;
  
  for (let i = 0; i < Math.min(5, parts.length); i++) {
    if (!validPart.test(parts[i])) {
      return { isValid: false, error: `Invalid cron expression part: ${parts[i]}` };
    }
  }
  
  return { isValid: true };
}

/**
 * Validate SQL query
 */
export function validateSQLQuery(query: string): { isValid: boolean; error?: string } {
  if (!query || query.trim() === '') {
    return { isValid: false, error: 'SQL query is required' };
  }
  
  // Basic SQL injection prevention
  const dangerousPatterns = [
    /;\s*drop\s+/i,
    /;\s*delete\s+/i,
    /;\s*truncate\s+/i,
    /;\s*create\s+/i,
    /;\s*alter\s+/i,
    /;\s*exec\s*\(/i,
    /;\s*execute\s*\(/i,
    /union\s+.*select/i,
    /'\s*or\s*'1'\s*=\s*'1/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) {
      return { isValid: false, error: 'Query contains potentially dangerous SQL commands' };
    }
  }
  
  return { isValid: true };
}

/**
 * Validate JSON string
 */
export function validateJSON(jsonString: string): { isValid: boolean; error?: string; parsed?: any } {
  if (!jsonString || jsonString.trim() === '') {
    return { isValid: false, error: 'JSON is required' };
  }
  
  try {
    const parsed = JSON.parse(jsonString);
    return { isValid: true, parsed };
  } catch (error) {
    return { isValid: false, error: 'Invalid JSON format' };
  }
}

// ============================================================================
// SCHEMA VALIDATORS
// ============================================================================

/**
 * Validate column definition
 */
export function validateColumnDefinition(column: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!column.name || typeof column.name !== 'string' || column.name.trim() === '') {
    errors.push('Column name is required');
  } else if (column.name.length > 128) {
    errors.push('Column name must be no more than 128 characters');
  }
  
  if (!column.dataType || typeof column.dataType !== 'string') {
    errors.push('Column data type is required');
  }
  
  if (column.nullable !== undefined && typeof column.nullable !== 'boolean') {
    errors.push('Column nullable must be a boolean');
  }
  
  if (column.defaultValue !== undefined && column.defaultValue !== null) {
    // Validate default value based on data type
    if (column.dataType === 'INTEGER' && isNaN(Number(column.defaultValue))) {
      errors.push('Default value must be a valid integer');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate table schema
 */
export function validateTableSchema(schema: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!schema || typeof schema !== 'object') {
    errors.push('Schema must be an object');
    return { isValid: false, errors };
  }
  
  if (!schema.tableName || typeof schema.tableName !== 'string') {
    errors.push('Table name is required');
  }
  
  if (!Array.isArray(schema.columns)) {
    errors.push('Columns must be an array');
  } else if (schema.columns.length === 0) {
    errors.push('At least one column is required');
  } else {
    schema.columns.forEach((column: any, index: number) => {
      const columnValidation = validateColumnDefinition(column);
      if (!columnValidation.isValid) {
        columnValidation.errors.forEach(error => {
          errors.push(`Column ${index + 1}: ${error}`);
        });
      }
    });
  }
  
  return { isValid: errors.length === 0, errors };
}

// ============================================================================
// CONFIGURATION VALIDATORS
// ============================================================================

/**
 * Validate discovery configuration
 */
export function validateDiscoveryConfig(config: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config || typeof config !== 'object') {
    errors.push('Configuration must be an object');
    return { isValid: false, errors };
  }
  
  if (!config.dataSourceId || typeof config.dataSourceId !== 'string') {
    errors.push('Data source ID is required');
  }
  
  if (config.scanDepth !== undefined) {
    if (typeof config.scanDepth !== 'number' || config.scanDepth < 1 || config.scanDepth > 10) {
      errors.push('Scan depth must be a number between 1 and 10');
    }
  }
  
  if (config.includeSystemTables !== undefined && typeof config.includeSystemTables !== 'boolean') {
    errors.push('Include system tables must be a boolean');
  }
  
  if (config.sampleSize !== undefined) {
    if (typeof config.sampleSize !== 'number' || config.sampleSize < 0 || config.sampleSize > 1000000) {
      errors.push('Sample size must be a number between 0 and 1,000,000');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate quality rule configuration
 */
export function validateQualityRuleConfig(rule: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!rule || typeof rule !== 'object') {
    errors.push('Rule must be an object');
    return { isValid: false, errors };
  }
  
  if (!rule.name || typeof rule.name !== 'string' || rule.name.trim() === '') {
    errors.push('Rule name is required');
  }
  
  if (!rule.type || typeof rule.type !== 'string') {
    errors.push('Rule type is required');
  }
  
  const validTypes = ['COMPLETENESS', 'UNIQUENESS', 'VALIDITY', 'CONSISTENCY', 'ACCURACY'];
  if (rule.type && !validTypes.includes(rule.type)) {
    errors.push(`Rule type must be one of: ${validTypes.join(', ')}`);
  }
  
  if (!rule.condition || typeof rule.condition !== 'string') {
    errors.push('Rule condition is required');
  }
  
  if (rule.threshold !== undefined) {
    if (typeof rule.threshold !== 'number' || rule.threshold < 0 || rule.threshold > 1) {
      errors.push('Threshold must be a number between 0 and 1');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

/**
 * Zod schema for asset creation
 */
export const AssetCreationSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  type: z.enum(['TABLE', 'VIEW', 'FILE', 'API', 'STREAM']),
  dataSourceId: z.string().uuid(),
  schema: z.object({
    columns: z.array(z.object({
      name: z.string().min(1).max(128),
      dataType: z.string(),
      nullable: z.boolean().optional(),
      primaryKey: z.boolean().optional(),
      defaultValue: z.any().optional()
    })).min(1)
  }).optional(),
  tags: z.array(z.string()).optional(),
  owner: z.string().optional(),
  steward: z.string().optional()
});

/**
 * Zod schema for data source configuration
 */
export const DataSourceConfigSchema = z.object({
  name: z.string().min(2).max(255),
  type: z.enum(['POSTGRESQL', 'MYSQL', 'MONGODB', 'SNOWFLAKE', 'DATABRICKS', 'S3', 'API']),
  connectionString: z.string().min(1),
  credentials: z.object({
    username: z.string().optional(),
    password: z.string().optional(),
    apiKey: z.string().optional(),
    token: z.string().optional()
  }).optional(),
  settings: z.record(z.any()).optional(),
  isActive: z.boolean().default(true)
});

/**
 * Zod schema for discovery job
 */
export const DiscoveryJobSchema = z.object({
  name: z.string().min(2).max(255),
  dataSourceId: z.string().uuid(),
  type: z.enum(['FULL', 'INCREMENTAL', 'SAMPLE']),
  schedule: z.object({
    frequency: z.enum(['MANUAL', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY']),
    cronExpression: z.string().optional()
  }).optional(),
  config: z.object({
    scanDepth: z.number().min(1).max(10).default(3),
    includeSystemTables: z.boolean().default(false),
    sampleSize: z.number().min(0).max(1000000).optional(),
    excludePatterns: z.array(z.string()).optional()
  }).optional()
});

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate data using Zod schema
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { isValid: boolean; data?: T; errors?: string[] } {
  try {
    const validData = schema.parse(data);
    return { isValid: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { isValid: false, errors };
    }
    return { isValid: false, errors: ['Validation failed'] };
  }
}

/**
 * Validate multiple fields with custom validators
 */
export function validateFields(
  fields: Record<string, any>,
  validators: Record<string, (value: any) => { isValid: boolean; error?: string }>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  Object.entries(validators).forEach(([fieldName, validator]) => {
    const value = fields[fieldName];
    const result = validator(value);
    
    if (!result.isValid && result.error) {
      errors[fieldName] = result.error;
    }
  });
  
  return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Combine multiple validation results
 */
export function combineValidationResults(
  ...results: Array<{ isValid: boolean; error?: string; errors?: string[] }>
): { isValid: boolean; errors: string[] } {
  const allErrors: string[] = [];
  let isValid = true;
  
  results.forEach(result => {
    if (!result.isValid) {
      isValid = false;
      if (result.error) allErrors.push(result.error);
      if (result.errors) allErrors.push(...result.errors);
    }
  });
  
  return { isValid, errors: allErrors };
}

// ============================================================================
// EXPORT DEFAULT VALIDATORS COLLECTION
// ============================================================================

export const validators = {
  // Basic validators
  email: validateEmail,
  url: validateUrl,
  required: validateRequired,
  length: validateLength,
  numberRange: validateNumberRange,
  
  // Catalog-specific validators
  assetName: validateAssetName,
  connectionString: validateConnectionString,
  cronExpression: validateCronExpression,
  sqlQuery: validateSQLQuery,
  json: validateJSON,
  
  // Schema validators
  columnDefinition: validateColumnDefinition,
  tableSchema: validateTableSchema,
  
  // Configuration validators
  discoveryConfig: validateDiscoveryConfig,
  qualityRuleConfig: validateQualityRuleConfig,
  
  // Zod schemas
  schemas: {
    assetCreation: AssetCreationSchema,
    dataSourceConfig: DataSourceConfigSchema,
    discoveryJob: DiscoveryJobSchema
  },
  
  // Utilities
  withSchema: validateWithSchema,
  fields: validateFields,
  combine: combineValidationResults
};

export default validators;