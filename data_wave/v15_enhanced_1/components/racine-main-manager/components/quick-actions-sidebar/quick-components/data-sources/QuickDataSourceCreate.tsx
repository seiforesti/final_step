'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Plus, Check, AlertCircle, Loader2, Eye, EyeOff, Server, Cloud, HardDrive, Globe, Key, Lock, TestTube, ChevronDown, Info, Settings, Zap, RefreshCw, Save, X, CheckCircle2, AlertTriangle, Clock, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Import foundation layers (100% backend integration)
import { useDataSources } from '../../../../hooks/useDataSources'
import { useConnectionValidator } from '../../../../hooks/useConnectionValidator'
import { useUserManagement } from '../../../../hooks/useUserManagement'
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement'
import { useActivityTracker } from '../../../../hooks/useActivityTracker'
import { useNotificationManager } from '../../../../hooks/useNotificationManager'
import { useSecurityManager } from '../../../../hooks/useSecurityManager'

// Import types (already implemented and validated)
import {
  DataSource,
  DataSourceType,
  ConnectionConfig,
  ValidationResult,
  SecurityPolicy,
  DataSourceTemplate,
  EncryptionConfig,
  AuthenticationMethod,
  ConnectionPool,
  DataSourceMetrics
} from '../../../../types/racine-core.types'

// Import utilities (already implemented and validated)
import { 
  validateConnectionString,
  generateConnectionHash,
  encryptCredentials,
  testConnectivity,
  optimizeConnectionPool,
  generateDataSourceId,
  formatConnectionString,
  parseConnectionParameters
} from '../../../../utils/data-source-utils'
import { 
  formatTimestamp,
  formatFileSize,
  formatDuration,
  truncateText
} from '../../../../utils/formatting-utils'

// Data source type configurations
const DATA_SOURCE_TYPES = {
  postgresql: {
    id: 'postgresql',
    name: 'PostgreSQL',
    icon: Database,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    defaultPort: 5432,
    requiresSchema: true,
    supportsBulkOperations: true,
    category: 'relational',
    connectionTemplate: 'postgresql://username:password@host:port/database',
    securityFeatures: ['ssl', 'encryption', 'authentication'],
    performance: 'high'
  },
  mysql: {
    id: 'mysql',
    name: 'MySQL',
    icon: Database,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    defaultPort: 3306,
    requiresSchema: true,
    supportsBulkOperations: true,
    category: 'relational',
    connectionTemplate: 'mysql://username:password@host:port/database',
    securityFeatures: ['ssl', 'encryption'],
    performance: 'high'
  },
  mongodb: {
    id: 'mongodb',
    name: 'MongoDB',
    icon: Database,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    defaultPort: 27017,
    requiresSchema: false,
    supportsBulkOperations: true,
    category: 'nosql',
    connectionTemplate: 'mongodb://username:password@host:port/database',
    securityFeatures: ['ssl', 'authentication', 'encryption'],
    performance: 'high'
  },
  snowflake: {
    id: 'snowflake',
    name: 'Snowflake',
    icon: Cloud,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    defaultPort: 443,
    requiresSchema: true,
    supportsBulkOperations: true,
    category: 'cloud',
    connectionTemplate: 'snowflake://account.region.provider/database/schema',
    securityFeatures: ['ssl', 'encryption', 'mfa', 'oauth'],
    performance: 'very_high'
  },
  s3: {
    id: 's3',
    name: 'Amazon S3',
    icon: HardDrive,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    defaultPort: 443,
    requiresSchema: false,
    supportsBulkOperations: true,
    category: 'storage',
    connectionTemplate: 's3://bucket-name/prefix',
    securityFeatures: ['iam', 'encryption', 'versioning'],
    performance: 'medium'
  },
  api: {
    id: 'api',
    name: 'REST API',
    icon: Globe,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    defaultPort: 443,
    requiresSchema: false,
    supportsBulkOperations: false,
    category: 'api',
    connectionTemplate: 'https://api.example.com/v1',
    securityFeatures: ['oauth', 'apikey', 'jwt'],
    performance: 'medium'
  }
} as const

interface QuickDataSourceCreateProps {
  onDataSourceCreated?: (dataSource: DataSource) => void
  onCancel?: () => void
  defaultType?: keyof typeof DATA_SOURCE_TYPES
  workspaceId?: string
  className?: string
}

export const QuickDataSourceCreate: React.FC<QuickDataSourceCreateProps> = ({
  onDataSourceCreated,
  onCancel,
  defaultType,
  workspaceId,
  className
}) => {
  // Core state management
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: defaultType || 'postgresql' as keyof typeof DATA_SOURCE_TYPES,
    host: '',
    port: '',
    database: '',
    schema: '',
    username: '',
    password: '',
    connectionString: '',
    useConnectionString: false,
    ssl: true,
    encryption: true,
    poolSize: 10,
    timeout: 30000,
    tags: [] as string[],
    isActive: true
  })

  const [validationState, setValidationState] = useState<{
    isValidating: boolean
    results: Record<string, ValidationResult>
    overall: 'valid' | 'invalid' | 'pending' | 'unknown'
  }>({
    isValidating: false,
    results: {},
    overall: 'unknown'
  })

  const [connectionTest, setConnectionTest] = useState<{
    isTesting: boolean
    result: 'success' | 'failure' | 'pending' | null
    message: string
    latency: number | null
    timestamp: number | null
  }>({
    isTesting: false,
    result: null,
    message: '',
    latency: null,
    timestamp: null
  })

  const [creationState, setCreationState] = useState<{
    isCreating: boolean
    progress: number
    currentStep: string
    error: string | null
  }>({
    isCreating: false,
    progress: 0,
    currentStep: '',
    error: null
  })

  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'security' | 'advanced'>('basic')
  const [tagInput, setTagInput] = useState('')
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<DataSourceTemplate | null>(null)

  // Custom hooks for comprehensive functionality
  const {
    createDataSource,
    getDataSourceTemplates,
    validateDataSourceConfig,
    getConnectionRequirements,
    optimizeConnectionSettings,
    getDataSourceByName,
    estimatePerformance
  } = useDataSources()

  const {
    validateConnection,
    testConnectivity: testConnectivityHook,
    validateCredentials,
    checkConnectivity,
    optimizeConnection,
    generateConnectionReport
  } = useConnectionValidator()

  const {
    getCurrentUser,
    getUserPermissions,
    checkUserAccess
  } = useUserManagement()

  const {
    getActiveWorkspace,
    getWorkspacePermissions,
    validateWorkspaceAccess
  } = useWorkspaceManagement()

  const {
    trackEvent,
    trackDataSourceCreation,
    logUserAction
  } = useActivityTracker()

  const {
    showNotification,
    showProgress
  } = useNotificationManager()

  const {
    encryptSensitiveData,
    validateSecurityCompliance,
    checkDataSourceSecurity
  } = useSecurityManager()

  // Get current data source type configuration
  const currentTypeConfig = useMemo(() => {
    return DATA_SOURCE_TYPES[formData.type]
  }, [formData.type])

  // Real-time form validation
  useEffect(() => {
    const validateForm = async () => {
      if (!formData.name.trim()) return

      setValidationState(prev => ({ ...prev, isValidating: true }))

      try {
        const validationResults: Record<string, ValidationResult> = {}

        // Validate name uniqueness
        if (formData.name.length >= 3) {
          const existingDataSource = await getDataSourceByName(formData.name)
          validationResults.name = {
            isValid: !existingDataSource,
            errors: existingDataSource ? ['Data source name already exists'] : [],
            warnings: [],
            suggestions: []
          }
        }

        // Validate connection parameters
        if (formData.useConnectionString && formData.connectionString) {
          const connectionValidation = await validateConnectionString(formData.connectionString, formData.type)
          validationResults.connectionString = connectionValidation
        } else if (formData.host && formData.database) {
          const configValidation = await validateDataSourceConfig({
            type: formData.type,
            host: formData.host,
            port: parseInt(formData.port) || currentTypeConfig.defaultPort,
            database: formData.database,
            schema: formData.schema,
            ssl: formData.ssl,
            encryption: formData.encryption
          })
          validationResults.connection = configValidation
        }

        // Validate security requirements
        if (formData.username && formData.password) {
          const securityValidation = await validateSecurityCompliance({
            username: formData.username,
            password: formData.password,
            ssl: formData.ssl,
            encryption: formData.encryption
          })
          validationResults.security = securityValidation
        }

        // Determine overall validation state
        const hasErrors = Object.values(validationResults).some(result => !result.isValid)
        const hasWarnings = Object.values(validationResults).some(result => result.warnings.length > 0)

        setValidationState({
          isValidating: false,
          results: validationResults,
          overall: hasErrors ? 'invalid' : (hasWarnings ? 'pending' : 'valid')
        })

      } catch (error) {
        console.error('Form validation error:', error)
        setValidationState(prev => ({
          ...prev,
          isValidating: false,
          overall: 'invalid'
        }))
      }
    }

    const debounceTimer = setTimeout(validateForm, 500)
    return () => clearTimeout(debounceTimer)
  }, [
    formData.name,
    formData.type,
    formData.host,
    formData.port,
    formData.database,
    formData.connectionString,
    formData.useConnectionString,
    formData.username,
    formData.password,
    formData.ssl,
    formData.encryption
  ])

  // Test connection functionality
  const handleTestConnection = useCallback(async () => {
    if (validationState.overall === 'invalid') {
      showNotification({
        type: 'error',
        title: 'Validation Required',
        message: 'Please fix validation errors before testing connection.',
        duration: 3000
      })
      return
    }

    setConnectionTest({
      istesting: true,
      result: 'pending',
      message: 'Testing connection...',
      latency: null,
      timestamp: null
    })

    try {
      const startTime = performance.now()

      const testConfig = formData.useConnectionString ? {
        connectionString: formData.connectionString,
        type: formData.type
      } : {
        type: formData.type,
        host: formData.host,
        port: parseInt(formData.port) || currentTypeConfig.defaultPort,
        database: formData.database,
        username: formData.username,
        password: formData.password,
        ssl: formData.ssl,
        encryption: formData.encryption,
        timeout: formData.timeout
      }

      const testResult = await testConnectivityHook(testConfig)
      const endTime = performance.now()
      const latency = endTime - startTime

      setConnectionTest({
        isTestin: false,
        result: testResult.success ? 'success' : 'failure',
        message: testResult.message || (testResult.success ? 'Connection successful!' : 'Connection failed'),
        latency: Math.round(latency),
        timestamp: Date.now()
      })

      // Track the test event
      trackEvent('data_source_connection_test', {
        type: formData.type,
        success: testResult.success,
        latency: Math.round(latency),
        error: testResult.error
      })

      if (testResult.success) {
        showNotification({
          type: 'success',
          title: 'Connection Test Successful',
          message: `Connected to ${formData.name || 'data source'} in ${Math.round(latency)}ms`,
          duration: 3000
        })
      } else {
        showNotification({
          type: 'error',
          title: 'Connection Test Failed',
          message: testResult.message || 'Unable to connect to the data source',
          duration: 5000
        })
      }

    } catch (error) {
      console.error('Connection test error:', error)
      setConnectionTest({
        isTestin: false,
        result: 'failure',
        message: `Test failed: ${(error as Error).message}`,
        latency: null,
        timestamp: Date.now()
      })

      showNotification({
        type: 'error',
        title: 'Connection Test Error',
        message: 'An error occurred while testing the connection.',
        duration: 5000
      })
    }
  }, [formData, validationState.overall, currentTypeConfig])

  // Create data source
  const handleCreateDataSource = useCallback(async () => {
    if (validationState.overall === 'invalid') {
      showNotification({
        type: 'error',
        title: 'Validation Required',
        message: 'Please fix all validation errors before creating the data source.',
        duration: 3000
      })
      return
    }

    setCreationState({
      isCreating: true,
      progress: 0,
      currentStep: 'Validating configuration...',
      error: null
    })

    try {
      const user = getCurrentUser()
      const workspace = await getActiveWorkspace()

      // Step 1: Final validation
      setCreationState(prev => ({ ...prev, progress: 20, currentStep: 'Validating permissions...' }))
      
      const hasPermission = await checkUserAccess('datasource:create')
      if (!hasPermission) {
        throw new Error('Insufficient permissions to create data source')
      }

      // Step 2: Encrypt sensitive data
      setCreationState(prev => ({ ...prev, progress: 40, currentStep: 'Encrypting credentials...' }))
      
      const encryptedCredentials = await encryptSensitiveData({
        username: formData.username,
        password: formData.password
      })

      // Step 3: Generate optimized configuration
      setCreationState(prev => ({ ...prev, progress: 60, currentStep: 'Optimizing configuration...' }))
      
      const optimizedConfig = await optimizeConnectionSettings({
        type: formData.type,
        poolSize: formData.poolSize,
        timeout: formData.timeout,
        expectedLoad: 'medium' // Could be determined by workspace size
      })

      // Step 4: Create data source
      setCreationState(prev => ({ ...prev, progress: 80, currentStep: 'Creating data source...' }))

      const dataSourceConfig: Partial<DataSource> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        connectionConfig: formData.useConnectionString ? {
          connectionString: formData.connectionString,
          encrypted: true
        } : {
          host: formData.host,
          port: parseInt(formData.port) || currentTypeConfig.defaultPort,
          database: formData.database,
          schema: formData.schema,
          ssl: formData.ssl,
          encryption: formData.encryption,
          encrypted: true
        },
        credentials: encryptedCredentials,
        settings: {
          ...optimizedConfig,
          poolSize: formData.poolSize,
          timeout: formData.timeout,
          retryAttempts: 3,
          retryDelay: 1000
        },
        security: {
          encryption: formData.encryption,
          ssl: formData.ssl,
          accessControl: 'workspace',
          auditEnabled: true
        },
        metadata: {
          tags: formData.tags,
          createdBy: user?.id,
          workspaceId: workspaceId || workspace?.id,
          category: currentTypeConfig.category,
          performance: currentTypeConfig.performance
        },
        isActive: formData.isActive,
        healthCheck: {
          enabled: true,
          interval: 300000, // 5 minutes
          timeout: 30000 // 30 seconds
        }
      }

      const createdDataSource = await createDataSource(dataSourceConfig)

      // Step 5: Finalize
      setCreationState(prev => ({ ...prev, progress: 100, currentStep: 'Finalizing...' }))

      // Track creation
      await trackDataSourceCreation(createdDataSource.id, {
        type: formData.type,
        category: currentTypeConfig.category,
        hasEncryption: formData.encryption,
        hasSSL: formData.ssl,
        workspaceId: workspaceId || workspace?.id
      })

      await logUserAction('data_source_created', {
        dataSourceId: createdDataSource.id,
        dataSourceName: createdDataSource.name,
        type: formData.type
      })

      // Success notification
      showNotification({
        type: 'success',
        title: 'Data Source Created',
        message: `${formData.name} has been successfully created and is ready for use.`,
        duration: 4000
      })

      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'postgresql',
        host: '',
        port: '',
        database: '',
        schema: '',
        username: '',
        password: '',
        connectionString: '',
        useConnectionString: false,
        ssl: true,
        encryption: true,
        poolSize: 10,
        timeout: 30000,
        tags: [],
        isActive: true
      })

      setCreationState({
        isCreating: false,
        progress: 0,
        currentStep: '',
        error: null
      })

      // Call callback
      onDataSourceCreated?.(createdDataSource)

    } catch (error) {
      console.error('Data source creation error:', error)
      
      setCreationState({
        isCreating: false,
        progress: 0,
        currentStep: '',
        error: (error as Error).message
      })

      showNotification({
        type: 'error',
        title: 'Creation Failed',
        message: `Failed to create data source: ${(error as Error).message}`,
        duration: 5000
      })
    }
  }, [formData, validationState.overall, workspaceId, onDataSourceCreated])

  // Handle form field changes
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-populate port when type changes
      if (field === 'type') {
        const typeConfig = DATA_SOURCE_TYPES[value as keyof typeof DATA_SOURCE_TYPES]
        updated.port = typeConfig.defaultPort.toString()
        updated.ssl = typeConfig.securityFeatures.includes('ssl')
        updated.encryption = typeConfig.securityFeatures.includes('encryption')
      }
      
      return updated
    })
  }, [])

  // Add tag functionality
  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }, [tagInput, formData.tags])

  // Remove tag functionality
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }, [])

  // Render validation indicator
  const renderValidationIndicator = (field: string) => {
    const result = validationState.results[field]
    if (!result) return null

    if (!result.isValid) {
      return (
        <Tooltip>
          <TooltipTrigger>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              {result.errors.map((error, index) => (
                <div key={index} className="text-sm text-red-600">{error}</div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )
    }

    if (result.warnings.length > 0) {
      return (
        <Tooltip>
          <TooltipTrigger>
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              {result.warnings.map((warning, index) => (
                <div key={index} className="text-sm text-yellow-600">{warning}</div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )
    }

    return <CheckCircle2 className="w-4 h-4 text-green-500" />
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("space-y-6 max-w-md mx-auto", className)}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Create Data Source</h3>
              <p className="text-sm text-muted-foreground">
                Connect to your data infrastructure
              </p>
            </div>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Creation Progress */}
        <AnimatePresence>
          {creationState.isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert>
                <Loader2 className="w-4 h-4 animate-spin" />
                <AlertTitle>Creating Data Source</AlertTitle>
                <AlertDescription className="space-y-2">
                  <div>{creationState.currentStep}</div>
                  <Progress value={creationState.progress} className="h-2" />
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {creationState.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>Creation Failed</AlertTitle>
                <AlertDescription>{creationState.error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Form */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Data Source Configuration</CardTitle>
              <div className="flex items-center gap-2">
                {validationState.isValidating && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
                {validationState.overall === 'valid' && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
                {validationState.overall === 'invalid' && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab as any} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                {/* Data Source Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Data Source Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleFieldChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DATA_SOURCE_TYPES).map(([key, config]) => {
                        const IconComponent = config.icon
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <IconComponent className={cn("w-4 h-4", config.color)} />
                              <span>{config.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {config.category}
                              </Badge>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="name">Name</Label>
                    {renderValidationIndicator('name')}
                  </div>
                  <Input
                    id="name"
                    placeholder="Enter data source name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className={cn(
                      validationState.results.name && !validationState.results.name.isValid
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    )}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Connection Method Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="useConnectionString"
                      checked={formData.useConnectionString}
                      onCheckedChange={(checked) => handleFieldChange('useConnectionString', checked)}
                    />
                    <Label htmlFor="useConnectionString">Use connection string</Label>
                  </div>
                </div>

                {/* Connection Configuration */}
                {formData.useConnectionString ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="connectionString">Connection String</Label>
                      {renderValidationIndicator('connectionString')}
                    </div>
                    <Textarea
                      id="connectionString"
                      placeholder={currentTypeConfig.connectionTemplate}
                      value={formData.connectionString}
                      onChange={(e) => handleFieldChange('connectionString', e.target.value)}
                      rows={2}
                      className={cn(
                        "font-mono text-sm",
                        validationState.results.connectionString && !validationState.results.connectionString.isValid
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      )}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="host">Host</Label>
                      <Input
                        id="host"
                        placeholder="localhost"
                        value={formData.host}
                        onChange={(e) => handleFieldChange('host', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        type="number"
                        placeholder={currentTypeConfig.defaultPort.toString()}
                        value={formData.port}
                        onChange={(e) => handleFieldChange('port', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="database">Database</Label>
                      <Input
                        id="database"
                        placeholder="Database name"
                        value={formData.database}
                        onChange={(e) => handleFieldChange('database', e.target.value)}
                      />
                    </div>
                    {currentTypeConfig.requiresSchema && (
                      <div className="space-y-2">
                        <Label htmlFor="schema">Schema</Label>
                        <Input
                          id="schema"
                          placeholder="public"
                          value={formData.schema}
                          onChange={(e) => handleFieldChange('schema', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Credentials */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={(e) => handleFieldChange('username', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => handleFieldChange('password', e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                {/* Security Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <Label htmlFor="ssl">SSL/TLS Encryption</Label>
                    </div>
                    <Switch
                      id="ssl"
                      checked={formData.ssl}
                      onCheckedChange={(checked) => handleFieldChange('ssl', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      <Label htmlFor="encryption">Data Encryption</Label>
                    </div>
                    <Switch
                      id="encryption"
                      checked={formData.encryption}
                      onCheckedChange={(checked) => handleFieldChange('encryption', checked)}
                    />
                  </div>

                  {/* Security Features */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Available Security Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {currentTypeConfig.securityFeatures.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <span className="text-sm capitalize">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                {/* Advanced Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="poolSize">Connection Pool Size</Label>
                    <Input
                      id="poolSize"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.poolSize}
                      onChange={(e) => handleFieldChange('poolSize', parseInt(e.target.value) || 10)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (ms)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      min="1000"
                      max="300000"
                      value={formData.timeout}
                      onChange={(e) => handleFieldChange('timeout', parseInt(e.target.value) || 30000)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleFieldChange('isActive', checked)}
                  />
                </div>

                {/* Performance Information */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Performance Characteristics</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Performance Level:</span>
                      <Badge variant="outline">{currentTypeConfig.performance.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Bulk Operations:</span>
                      <span>{currentTypeConfig.supportsBulkOperations ? 'Supported' : 'Not Supported'}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Connection Test */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TestTube className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Test Connection</h4>
                  <p className="text-sm text-muted-foreground">
                    Verify connectivity before creating
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={connectionTest.isTestin || validationState.overall === 'invalid'}
              >
                {connectionTest.isTestin ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <TestTube className="w-4 h-4 mr-2" />
                )}
                Test
              </Button>
            </div>

            {/* Test Results */}
            <AnimatePresence>
              {connectionTest.result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <Alert variant={connectionTest.result === 'success' ? 'default' : 'destructive'}>
                    {connectionTest.result === 'success' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <AlertTitle>
                      {connectionTest.result === 'success' ? 'Connection Successful' : 'Connection Failed'}
                    </AlertTitle>
                    <AlertDescription className="space-y-1">
                      <div>{connectionTest.message}</div>
                      {connectionTest.latency && (
                        <div className="text-xs text-muted-foreground">
                          Latency: {connectionTest.latency}ms • {formatTimestamp(connectionTest.timestamp!)}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleCreateDataSource}
            disabled={creationState.isCreating || validationState.overall === 'invalid'}
            className="flex-1"
          >
            {creationState.isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Create Data Source
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </motion.div>
    </TooltipProvider>
  )
}

export default QuickDataSourceCreate