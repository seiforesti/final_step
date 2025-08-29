'use client'

import {
  DataSource,
  DataSourceType,
  ConnectionConfig,
  ValidationResult,
  DataSourceTemplate,
  PerformanceMetrics,
  SecurityPolicy,
  ConnectionPool,
  DataSourceHealth
} from '../types/racine-core.types'

/**
 * Data Source Utility Functions
 * Provides comprehensive utilities for data source management, validation, and optimization
 */

// Connection string validation patterns
const CONNECTION_PATTERNS = {
  postgresql: /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/,
  mysql: /^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/,
  mongodb: /^mongodb:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/,
  snowflake: /^snowflake:\/\/([^\.]+)\.([^\.]+)\.([^\/]+)\/([^\/]+)\/(.+)$/,
  s3: /^s3:\/\/([^\/]+)\/?(.*)$/,
  api: /^https?:\/\/[\w\-\.]+(?::\d+)?(?:\/.*)?$/
} as const

// Default ports for different data source types
export const DEFAULT_PORTS = {
  postgresql: 5432,
  mysql: 3306,
  mongodb: 27017,
  snowflake: 443,
  s3: 443,
  redis: 6379,
  api: 443
} as const

// Data source type configurations
export const DATA_SOURCE_CONFIGS = {
  postgresql: {
    name: 'PostgreSQL',
    category: 'relational',
    requiresSchema: true,
    supportsBulkOperations: true,
    securityFeatures: ['ssl', 'encryption', 'authentication'],
    connectionTemplate: 'postgresql://username:password@host:port/database',
    defaultTimeout: 30000,
    maxConnections: 100
  },
  mysql: {
    name: 'MySQL',
    category: 'relational',
    requiresSchema: true,
    supportsBulkOperations: true,
    securityFeatures: ['ssl', 'encryption'],
    connectionTemplate: 'mysql://username:password@host:port/database',
    defaultTimeout: 30000,
    maxConnections: 100
  },
  mongodb: {
    name: 'MongoDB',
    category: 'nosql',
    requiresSchema: false,
    supportsBulkOperations: true,
    securityFeatures: ['ssl', 'authentication', 'encryption'],
    connectionTemplate: 'mongodb://username:password@host:port/database',
    defaultTimeout: 30000,
    maxConnections: 50
  },
  snowflake: {
    name: 'Snowflake',
    category: 'cloud',
    requiresSchema: true,
    supportsBulkOperations: true,
    securityFeatures: ['ssl', 'encryption', 'mfa', 'oauth'],
    connectionTemplate: 'snowflake://account.region.provider/database/schema',
    defaultTimeout: 60000,
    maxConnections: 20
  },
  s3: {
    name: 'Amazon S3',
    category: 'storage',
    requiresSchema: false,
    supportsBulkOperations: true,
    securityFeatures: ['iam', 'encryption', 'versioning'],
    connectionTemplate: 's3://bucket-name/prefix',
    defaultTimeout: 30000,
    maxConnections: 10
  },
  redis: {
    name: 'Redis',
    category: 'cache',
    requiresSchema: false,
    supportsBulkOperations: false,
    securityFeatures: ['auth', 'ssl'],
    connectionTemplate: 'redis://username:password@host:port',
    defaultTimeout: 5000,
    maxConnections: 50
  },
  api: {
    name: 'REST API',
    category: 'api',
    requiresSchema: false,
    supportsBulkOperations: false,
    securityFeatures: ['oauth', 'apikey', 'jwt'],
    connectionTemplate: 'https://api.example.com/v1',
    defaultTimeout: 30000,
    maxConnections: 20
  }
} as const

/**
 * Validate a connection string format
 */
export const validateConnectionString = async (
  connectionString: string,
  type: DataSourceType
): Promise<ValidationResult> => {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  try {
    // Check if connection string is empty
    if (!connectionString.trim()) {
      errors.push('Connection string cannot be empty')
      return { isValid: false, errors, warnings, suggestions }
    }

    // Get pattern for the data source type
    const pattern = CONNECTION_PATTERNS[type]
    if (!pattern) {
      errors.push(`Unsupported data source type: ${type}`)
      return { isValid: false, errors, warnings, suggestions }
    }

    // Validate against pattern
    const match = connectionString.match(pattern)
    if (!match) {
      errors.push(`Invalid connection string format for ${type}`)
      suggestions.push(`Expected format: ${DATA_SOURCE_CONFIGS[type].connectionTemplate}`)
      return { isValid: false, errors, warnings, suggestions }
    }

    // Type-specific validations
    switch (type) {
      case 'postgresql':
      case 'mysql':
      case 'mongodb':
        const [, username, password, host, port, database] = match
        
        if (!username) {
          errors.push('Username is required')
        }
        
        if (!password) {
          warnings.push('Password is empty - this may cause authentication issues')
        }
        
        if (!host) {
          errors.push('Host is required')
        }
        
        const portNum = parseInt(port)
        if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
          errors.push('Port must be a valid number between 1 and 65535')
        }
        
        if (!database) {
          errors.push('Database name is required')
        }
        
        // Check for localhost in production
        if (host === 'localhost' || host === '127.0.0.1') {
          warnings.push('Using localhost may not work in production environments')
        }
        
        break

      case 'snowflake':
        const [, account, region, provider, db, schema] = match
        
        if (!account) {
          errors.push('Snowflake account name is required')
        }
        
        if (!region) {
          errors.push('Snowflake region is required')
        }
        
        if (!provider) {
          errors.push('Snowflake cloud provider is required')
        }
        
        if (!db) {
          errors.push('Database name is required')
        }
        
        if (!schema) {
          warnings.push('Schema not specified - will use default schema')
        }
        
        break

      case 's3':
        const [, bucket, prefix] = match
        
        if (!bucket) {
          errors.push('S3 bucket name is required')
        }
        
        // Validate bucket name format
        const bucketNameRegex = /^[a-z0-9][a-z0-9\-]{1,61}[a-z0-9]$/
        if (bucket && !bucketNameRegex.test(bucket)) {
          errors.push('Invalid S3 bucket name format')
          suggestions.push('Bucket names must be 3-63 characters, lowercase, and contain only letters, numbers, and hyphens')
        }
        
        if (prefix && prefix.startsWith('/')) {
          warnings.push('S3 prefix should not start with /')
        }
        
        break

      case 'api':
        try {
          const url = new URL(connectionString)
          
          if (!['http:', 'https:'].includes(url.protocol)) {
            errors.push('API URL must use HTTP or HTTPS protocol')
          }
          
          if (url.protocol === 'http:' && !url.hostname.includes('localhost')) {
            warnings.push('Using HTTP in production is not recommended - consider HTTPS')
          }
          
          if (!url.hostname) {
            errors.push('API hostname is required')
          }
          
        } catch (urlError) {
          errors.push('Invalid URL format')
        }
        
        break
    }

    // Additional security warnings
    if (connectionString.includes('password') && connectionString.includes('123')) {
      warnings.push('Weak password detected - consider using a stronger password')
    }

    if (type !== 'api' && !connectionString.includes('ssl=true') && !connectionString.includes('sslmode=require')) {
      warnings.push('SSL/TLS encryption not explicitly enabled - consider enabling for security')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }

  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${(error as Error).message}`],
      warnings: [],
      suggestions: []
    }
  }
}

/**
 * Generate a unique connection hash for caching and identification
 */
export const generateConnectionHash = (config: ConnectionConfig): string => {
  try {
    const hashData = {
      type: config.type,
      host: config.host,
      port: config.port,
      database: config.database,
      schema: config.schema,
      connectionString: config.connectionString
    }
    
    const hashString = JSON.stringify(hashData)
    
    // Simple hash function (in production, use a proper crypto library)
    let hash = 0
    for (let i = 0; i < hashString.length; i++) {
      const char = hashString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36)
  } catch (error) {
    return Date.now().toString(36)
  }
}

/**
 * Encrypt sensitive credentials (placeholder - implement with proper encryption)
 */
export const encryptCredentials = async (credentials: {
  username?: string
  password?: string
  apiKey?: string
  token?: string
}): Promise<any> => {
  // In production, implement proper encryption using crypto libraries
  // This is a placeholder implementation
  const encrypted = {
    ...credentials,
    encrypted: true,
    timestamp: Date.now()
  }
  
  // Replace sensitive values with encrypted versions
  if (credentials.password) {
    encrypted.password = `encrypted_${btoa(credentials.password)}_${Date.now()}`
  }
  
  if (credentials.apiKey) {
    encrypted.apiKey = `encrypted_${btoa(credentials.apiKey)}_${Date.now()}`
  }
  
  if (credentials.token) {
    encrypted.token = `encrypted_${btoa(credentials.token)}_${Date.now()}`
  }
  
  return encrypted
}

/**
 * Test basic connectivity (placeholder for actual implementation)
 */
export const testConnectivity = async (config: ConnectionConfig): Promise<{
  success: boolean
  latency: number
  message: string
  error?: string
}> => {
  try {
    const startTime = performance.now()
    
    // Simulate connection test delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500))
    
    const endTime = performance.now()
    const latency = endTime - startTime
    
    // Simulate success/failure based on configuration
    const success = Math.random() > 0.1 // 90% success rate for simulation
    
    if (success) {
      return {
        success: true,
        latency: Math.round(latency),
        message: `Successfully connected to ${config.type} data source`
      }
    } else {
      return {
        success: false,
        latency: Math.round(latency),
        message: 'Connection failed',
        error: 'Simulated connection error for testing'
      }
    }
  } catch (error) {
    return {
      success: false,
      latency: 0,
      message: 'Connection test failed',
      error: (error as Error).message
    }
  }
}

/**
 * Optimize connection pool settings based on usage patterns
 */
export const optimizeConnectionPool = async (config: {
  type: DataSourceType
  currentPoolSize: number
  expectedLoad: 'low' | 'medium' | 'high'
  avgLatency: number
  errorRate: number
}): Promise<ConnectionPool> => {
  const typeConfig = DATA_SOURCE_CONFIGS[config.type]
  let recommendedPoolSize = config.currentPoolSize
  let recommendedTimeout = typeConfig.defaultTimeout
  let recommendedMaxConnections = typeConfig.maxConnections

  // Adjust based on expected load
  switch (config.expectedLoad) {
    case 'low':
      recommendedPoolSize = Math.max(5, Math.ceil(config.currentPoolSize * 0.7))
      break
    case 'medium':
      recommendedPoolSize = config.currentPoolSize
      break
    case 'high':
      recommendedPoolSize = Math.min(recommendedMaxConnections, Math.ceil(config.currentPoolSize * 1.5))
      break
  }

  // Adjust based on performance metrics
  if (config.avgLatency > 1000) {
    recommendedTimeout = Math.min(60000, recommendedTimeout * 2)
  }

  if (config.errorRate > 0.05) { // More than 5% error rate
    recommendedPoolSize = Math.max(3, Math.ceil(recommendedPoolSize * 0.8))
  }

  return {
    minSize: Math.max(1, Math.ceil(recommendedPoolSize * 0.3)),
    maxSize: recommendedPoolSize,
    acquireTimeoutMillis: recommendedTimeout,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 300000, // 5 minutes
    reapIntervalMillis: 60000, // 1 minute
    createRetryIntervalMillis: 200,
    maxRetries: 3,
    validateOnBorrow: true,
    validateOnReturn: false,
    maxWaitingClients: recommendedPoolSize * 2
  }
}

/**
 * Generate a unique data source ID
 */
export const generateDataSourceId = (): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `ds_${timestamp}_${random}`
}

/**
 * Format connection string from individual parameters
 */
export const formatConnectionString = (
  type: DataSourceType,
  config: {
    username?: string
    password?: string
    host?: string
    port?: number
    database?: string
    schema?: string
    ssl?: boolean
    [key: string]: any
  }
): string => {
  const typeConfig = DATA_SOURCE_CONFIGS[type]
  
  switch (type) {
    case 'postgresql':
      const pgSsl = config.ssl ? '?sslmode=require' : ''
      return `postgresql://${config.username}:${config.password}@${config.host}:${config.port || DEFAULT_PORTS.postgresql}/${config.database}${pgSsl}`
    
    case 'mysql':
      const mysqlSsl = config.ssl ? '?ssl=true' : ''
      return `mysql://${config.username}:${config.password}@${config.host}:${config.port || DEFAULT_PORTS.mysql}/${config.database}${mysqlSsl}`
    
    case 'mongodb':
      const mongoSsl = config.ssl ? '?ssl=true' : ''
      return `mongodb://${config.username}:${config.password}@${config.host}:${config.port || DEFAULT_PORTS.mongodb}/${config.database}${mongoSsl}`
    
    case 'snowflake':
      return `snowflake://${config.account}.${config.region}.${config.provider}/${config.database}/${config.schema || 'public'}`
    
    case 's3':
      const prefix = config.prefix ? `/${config.prefix}` : ''
      return `s3://${config.bucket}${prefix}`
    
    case 'redis':
      const auth = config.username && config.password ? `${config.username}:${config.password}@` : ''
      return `redis://${auth}${config.host}:${config.port || DEFAULT_PORTS.redis}`
    
    case 'api':
      return config.baseUrl || config.host || ''
    
    default:
      return typeConfig.connectionTemplate
  }
}

/**
 * Parse connection string into individual parameters
 */
export const parseConnectionParameters = (
  connectionString: string,
  type: DataSourceType
): Partial<ConnectionConfig> => {
  try {
    const pattern = CONNECTION_PATTERNS[type]
    if (!pattern) {
      throw new Error(`Unsupported data source type: ${type}`)
    }

    const match = connectionString.match(pattern)
    if (!match) {
      throw new Error(`Invalid connection string format for ${type}`)
    }

    switch (type) {
      case 'postgresql':
      case 'mysql':
      case 'mongodb':
        const [, username, password, host, port, database] = match
        return {
          type,
          username,
          password,
          host,
          port: parseInt(port),
          database,
          ssl: connectionString.includes('ssl=true') || connectionString.includes('sslmode=require')
        }

      case 'snowflake':
        const [, account, region, provider, db, schema] = match
        return {
          type,
          host: `${account}.${region}.${provider}.snowflakecomputing.com`,
          database: db,
          schema,
          port: DEFAULT_PORTS.snowflake
        }

      case 's3':
        const [, bucket, prefix] = match
        return {
          type,
          bucket,
          prefix: prefix || '',
          host: 's3.amazonaws.com',
          port: DEFAULT_PORTS.s3
        }

      case 'api':
        const url = new URL(connectionString)
        return {
          type,
          host: url.hostname,
          port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
          baseUrl: connectionString,
          ssl: url.protocol === 'https:'
        }

      default:
        return { type }
    }
  } catch (error) {
    console.error('Error parsing connection parameters:', error)
    return { type }
  }
}

/**
 * Get data source type configuration
 */
export const getDataSourceConfig = (type: DataSourceType) => {
  return DATA_SOURCE_CONFIGS[type] || null
}

/**
 * Validate data source name
 */
export const validateDataSourceName = (name: string): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  if (!name || !name.trim()) {
    errors.push('Data source name is required')
    return { isValid: false, errors, warnings, suggestions }
  }

  const trimmedName = name.trim()

  // Length validation
  if (trimmedName.length < 3) {
    errors.push('Data source name must be at least 3 characters long')
  }

  if (trimmedName.length > 100) {
    errors.push('Data source name must be less than 100 characters')
  }

  // Character validation
  const validNameRegex = /^[a-zA-Z0-9_\-\s]+$/
  if (!validNameRegex.test(trimmedName)) {
    errors.push('Data source name can only contain letters, numbers, spaces, hyphens, and underscores')
  }

  // Reserved names
  const reservedNames = ['admin', 'root', 'system', 'default', 'test']
  if (reservedNames.includes(trimmedName.toLowerCase())) {
    warnings.push('Using reserved names may cause conflicts')
  }

  // Best practices
  if (trimmedName.includes('  ')) {
    suggestions.push('Consider removing extra spaces from the name')
  }

  if (trimmedName.startsWith(' ') || trimmedName.endsWith(' ')) {
    suggestions.push('Consider trimming leading/trailing spaces')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  }
}

/**
 * Generate data source template
 */
export const generateDataSourceTemplate = (
  type: DataSourceType,
  templateName: string,
  description?: string
): DataSourceTemplate => {
  const config = DATA_SOURCE_CONFIGS[type]
  
  return {
    id: generateDataSourceId(),
    name: templateName,
    description: description || `Template for ${config.name} data sources`,
    type,
    category: config.category,
    connectionTemplate: config.connectionTemplate,
    defaultSettings: {
      port: DEFAULT_PORTS[type],
      timeout: config.defaultTimeout,
      poolSize: 10,
      ssl: config.securityFeatures.includes('ssl'),
      encryption: config.securityFeatures.includes('encryption')
    },
    securityFeatures: config.securityFeatures,
    supportedOperations: {
      bulkOperations: config.supportsBulkOperations,
      realTimeSync: ['postgresql', 'mysql', 'mongodb'].includes(type),
      streaming: ['api', 's3'].includes(type),
      caching: ['redis'].includes(type)
    },
    metadata: {
      createdAt: Date.now(),
      version: '1.0.0',
      tags: [config.category, type],
      documentation: `https://docs.example.com/datasources/${type}`
    }
  }
}

/**
 * Calculate data source health score
 */
export const calculateDataSourceHealthScore = (health: DataSourceHealth): number => {
  let score = 100

  // Deduct points based on status
  switch (health.status) {
    case 'error':
    case 'disconnected':
      score -= 50
      break
    case 'warning':
    case 'degraded':
      score -= 25
      break
    case 'connecting':
      score -= 10
      break
  }

  // Deduct points based on error rate
  if (health.errorRate) {
    score -= Math.min(30, health.errorRate * 100)
  }

  // Deduct points based on latency
  if (health.latency) {
    if (health.latency > 5000) score -= 20
    else if (health.latency > 2000) score -= 10
    else if (health.latency > 1000) score -= 5
  }

  // Deduct points based on uptime
  if (health.uptime !== undefined) {
    if (health.uptime < 0.95) score -= 15
    else if (health.uptime < 0.99) score -= 5
  }

  return Math.max(0, Math.round(score))
}

/**
 * Export all utility functions
 */
export default {
  validateConnectionString,
  generateConnectionHash,
  encryptCredentials,
  testConnectivity,
  optimizeConnectionPool,
  generateDataSourceId,
  formatConnectionString,
  parseConnectionParameters,
  getDataSourceConfig,
  validateDataSourceName,
  generateDataSourceTemplate,
  calculateDataSourceHealthScore,
  DATA_SOURCE_CONFIGS,
  DEFAULT_PORTS,
  CONNECTION_PATTERNS
}
