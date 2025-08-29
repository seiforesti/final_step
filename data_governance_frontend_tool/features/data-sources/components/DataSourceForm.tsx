'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Database,
  TestTube,
  Save,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Plus,
  Minus,
  Cloud,
  Server,
  Lock,
  Zap,
  Settings,
  Tag,
  Users,
  Calendar,
  Shield,
  Info
} from 'lucide-react';
import {
  useCreateDataSource,
  useUpdateDataSource,
  useTestConnection,
  useDataSource
} from '../hooks/useDataSources';
import type {
  DataSource,
  DataSourceFormData,
  DataSourceType,
  Environment,
  Criticality,
  DataClassification,
  DataSourceLocation,
  CloudProvider,
  ScanFrequency
} from '@/types/data-source.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

// Form validation schema
const dataSourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  type: z.nativeEnum({
    mysql: 'mysql',
    postgresql: 'postgresql',
    mongodb: 'mongodb',
    snowflake: 'snowflake',
    s3: 's3',
    redis: 'redis'
  } as const),
  environment: z.nativeEnum({
    production: 'production',
    staging: 'staging',
    development: 'development',
    test: 'test'
  } as const),
  criticality: z.nativeEnum({
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low'
  } as const),
  classification: z.nativeEnum({
    public: 'public',
    internal: 'internal',
    confidential: 'confidential',
    restricted: 'restricted'
  } as const),
  location: z.nativeEnum({
    on_prem: 'on_prem',
    cloud: 'cloud',
    hybrid: 'hybrid'
  } as const),
  cloud_provider: z.nativeEnum({
    aws: 'aws',
    azure: 'azure',
    gcp: 'gcp'
  } as const).optional(),
  region: z.string().optional(),
  
  // Connection configuration
  connection_config: z.object({
    host: z.string().min(1, 'Host is required'),
    port: z.number().min(1).max(65535).optional(),
    database: z.string().optional(),
    schema: z.string().optional(),
    username: z.string().optional(),
    password_encrypted: z.string().optional(),
    connection_string: z.string().optional(),
    ssl_enabled: z.boolean().default(false),
    timeout_seconds: z.number().min(1).max(300).default(30),
    pool_size: z.number().min(1).max(100).default(5),
  }),
  
  // Metadata
  metadata: z.object({
    business_owner: z.string().optional(),
    technical_owner: z.string().optional(),
    department: z.string().optional(),
    cost_center: z.string().optional(),
    compliance_requirements: z.array(z.string()).default([]),
  }),
  
  // Scan settings
  scan_settings: z.object({
    enabled: z.boolean().default(true),
    frequency: z.nativeEnum({
      hourly: 'hourly',
      daily: 'daily',
      weekly: 'weekly',
      monthly: 'monthly'
    } as const).default('daily'),
    scan_types: z.array(z.string()).default(['schema_discovery']),
    include_patterns: z.array(z.string()).default([]),
    exclude_patterns: z.array(z.string()).default([]),
    max_depth: z.number().min(1).max(10).default(3),
    sample_size: z.number().min(100).max(1000000).default(1000),
    parallel_threads: z.number().min(1).max(20).default(4),
  }),
  
  tags: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof dataSourceSchema>;

interface DataSourceFormProps {
  id?: string; // If provided, we're editing
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DataSourceForm({ id, onSuccess, onCancel }: DataSourceFormProps) {
  const router = useRouter();
  const isEditing = !!id;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<any>(null);
  const [newTag, setNewTag] = useState('');

  // API hooks
  const { data: existingDataSource, isLoading: loadingDataSource } = useDataSource(id!, !!id);
  const createDataSource = useCreateDataSource();
  const updateDataSource = useUpdateDataSource();
  const testConnection = useTestConnection();

  // Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(dataSourceSchema),
    defaultValues: {
      type: 'postgresql',
      environment: 'development',
      criticality: 'medium',
      classification: 'internal',
      location: 'on_prem',
      connection_config: {
        ssl_enabled: false,
        timeout_seconds: 30,
        pool_size: 5,
      },
      metadata: {
        compliance_requirements: [],
      },
      scan_settings: {
        enabled: true,
        frequency: 'daily',
        scan_types: ['schema_discovery'],
        include_patterns: [],
        exclude_patterns: [],
        max_depth: 3,
        sample_size: 1000,
        parallel_threads: 4,
      },
      tags: [],
    }
  });

  const watchedType = watch('type');
  const watchedLocation = watch('location');
  const watchedTags = watch('tags');

  // Load existing data for editing
  useEffect(() => {
    if (existingDataSource && isEditing) {
      reset({
        name: existingDataSource.name,
        description: existingDataSource.description,
        type: existingDataSource.type,
        environment: existingDataSource.environment,
        criticality: existingDataSource.criticality,
        classification: existingDataSource.classification,
        location: existingDataSource.location,
        cloud_provider: existingDataSource.cloud_provider,
        region: existingDataSource.region,
        connection_config: {
          ...existingDataSource.connection_config,
          password_encrypted: '', // Don't prefill password
        },
        metadata: existingDataSource.metadata || {},
        scan_settings: existingDataSource.scan_settings || {},
        tags: existingDataSource.tags?.map(tag => tag.name) || [],
      });
    }
  }, [existingDataSource, isEditing, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateDataSource.mutateAsync({
          id: id!,
          data: data as any
        });
      } else {
        await createDataSource.mutateAsync(data as any);
      }
      
      onSuccess?.();
      router.push('/data-sources');
    } catch (error) {
      console.error('Failed to save data source:', error);
    }
  };

  const handleTestConnection = async () => {
    const connectionConfig = getValues('connection_config');
    try {
      const result = await testConnection.mutateAsync(connectionConfig);
      setConnectionTestResult(result);
    } catch (error) {
      setConnectionTestResult({ success: false, error_message: 'Connection test failed' });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
      setValue('tags', [...watchedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const getPortPlaceholder = (type: DataSourceType): string => {
    switch (type) {
      case 'mysql': return '3306';
      case 'postgresql': return '5432';
      case 'mongodb': return '27017';
      case 'redis': return '6379';
      default: return '';
    }
  };

  if (loadingDataSource) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading data source..." />
      </div>
    );
  }

  const steps = [
    { id: 1, name: 'Basic Information', icon: Info },
    { id: 2, name: 'Connection', icon: Database },
    { id: 3, name: 'Configuration', icon: Settings },
    { id: 4, name: 'Metadata & Tags', icon: Tag },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? 'Edit Data Source' : 'Add New Data Source'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 'Update your data source configuration' : 'Connect a new data source to your governance platform'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel || (() => router.back())}
            className="btn-outline flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="card">
        <div className="card-content">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                  currentStep >= step.id
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                )}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <span className={cn(
                  "ml-2 text-sm font-medium",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-4",
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <p className="text-sm text-muted-foreground">
                Provide basic details about your data source
              </p>
            </div>
            <div className="card-content space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Name *</label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="e.g., Production Customer Database"
                        className={cn("form-input", errors.name && "border-destructive")}
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Type *</label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={cn("form-input", errors.type && "border-destructive")}
                      >
                        <option value="mysql">MySQL</option>
                        <option value="postgresql">PostgreSQL</option>
                        <option value="mongodb">MongoDB</option>
                        <option value="snowflake">Snowflake</option>
                        <option value="s3">Amazon S3</option>
                        <option value="redis">Redis</option>
                      </select>
                    )}
                  />
                  {errors.type && (
                    <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="Describe the purpose and contents of this data source..."
                      className="form-input"
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="form-label">Environment *</label>
                  <Controller
                    name="environment"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={cn("form-input", errors.environment && "border-destructive")}
                      >
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                        <option value="development">Development</option>
                        <option value="test">Test</option>
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="form-label">Criticality *</label>
                  <Controller
                    name="criticality"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={cn("form-input", errors.criticality && "border-destructive")}
                      >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="form-label">Classification *</label>
                  <Controller
                    name="classification"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={cn("form-input", errors.classification && "border-destructive")}
                      >
                        <option value="public">Public</option>
                        <option value="internal">Internal</option>
                        <option value="confidential">Confidential</option>
                        <option value="restricted">Restricted</option>
                      </select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="form-label">Location *</label>
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={cn("form-input", errors.location && "border-destructive")}
                      >
                        <option value="on_prem">On-Premise</option>
                        <option value="cloud">Cloud</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    )}
                  />
                </div>

                {watchedLocation === 'cloud' && (
                  <>
                    <div>
                      <label className="form-label">Cloud Provider</label>
                      <Controller
                        name="cloud_provider"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="form-input"
                          >
                            <option value="">Select Provider</option>
                            <option value="aws">Amazon Web Services</option>
                            <option value="azure">Microsoft Azure</option>
                            <option value="gcp">Google Cloud Platform</option>
                          </select>
                        )}
                      />
                    </div>

                    <div>
                      <label className="form-label">Region</label>
                      <Controller
                        name="region"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder="e.g., us-east-1"
                            className="form-input"
                          />
                        )}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Connection */}
        {currentStep === 2 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Connection Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Configure how to connect to your data source
              </p>
            </div>
            <div className="card-content space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Host *</label>
                  <Controller
                    name="connection_config.host"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="localhost or IP address"
                        className={cn("form-input", errors.connection_config?.host && "border-destructive")}
                      />
                    )}
                  />
                  {errors.connection_config?.host && (
                    <p className="text-sm text-destructive mt-1">{errors.connection_config.host.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Port</label>
                  <Controller
                    name="connection_config.port"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        placeholder={getPortPlaceholder(watchedType)}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        className={cn("form-input", errors.connection_config?.port && "border-destructive")}
                      />
                    )}
                  />
                  {errors.connection_config?.port && (
                    <p className="text-sm text-destructive mt-1">{errors.connection_config.port.message}</p>
                  )}
                </div>
              </div>

              {watchedType !== 's3' && watchedType !== 'redis' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Database</label>
                    <Controller
                      name="connection_config.database"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Database name"
                          className="form-input"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="form-label">Schema</label>
                    <Controller
                      name="connection_config.schema"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Schema name (optional)"
                          className="form-input"
                        />
                      )}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Username</label>
                  <Controller
                    name="connection_config.username"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Database username"
                        className="form-input"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <Controller
                      name="connection_config.password_encrypted"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Database password"
                          className="form-input pr-10"
                        />
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Advanced Connection Settings */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-foreground">Advanced Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="form-label">Connection Timeout (seconds)</label>
                    <Controller
                      name="connection_config.timeout_seconds"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="1"
                          max="300"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="form-input"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="form-label">Pool Size</label>
                    <Controller
                      name="connection_config.pool_size"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="1"
                          max="100"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="form-input"
                        />
                      )}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="connection_config.ssl_enabled"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded border-border"
                        />
                      )}
                    />
                    <label className="form-label">Enable SSL</label>
                  </div>
                </div>
              </div>

              {/* Connection Test */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-medium text-foreground">Test Connection</h4>
                    <p className="text-sm text-muted-foreground">
                      Verify that the connection settings are correct
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testConnection.isPending}
                    className="btn-outline flex items-center space-x-2"
                  >
                    {testConnection.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    <span>Test Connection</span>
                  </button>
                </div>

                {connectionTestResult && (
                  <div className={cn(
                    "mt-4 p-4 rounded-lg border",
                    connectionTestResult.success
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  )}>
                    <div className="flex items-center space-x-2">
                      {connectionTestResult.success ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5" />
                      )}
                      <span className="font-medium">
                        {connectionTestResult.success ? 'Connection Successful' : 'Connection Failed'}
                      </span>
                    </div>
                    {connectionTestResult.success ? (
                      <p className="mt-1 text-sm">
                        Response time: {connectionTestResult.response_time_ms}ms
                      </p>
                    ) : (
                      <p className="mt-1 text-sm">
                        {connectionTestResult.error_message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Configuration */}
        {currentStep === 3 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Scan Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Configure how this data source will be scanned and monitored
              </p>
            </div>
            <div className="card-content space-y-6">
              <div className="flex items-center space-x-2">
                <Controller
                  name="scan_settings.enabled"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-border"
                    />
                  )}
                />
                <label className="form-label">Enable automatic scanning</label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Scan Frequency</label>
                  <Controller
                    name="scan_settings.frequency"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="form-input"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="form-label">Max Scan Depth</label>
                  <Controller
                    name="scan_settings.max_depth"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="1"
                        max="10"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="form-input"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Sample Size</label>
                  <Controller
                    name="scan_settings.sample_size"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="100"
                        max="1000000"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="form-input"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="form-label">Parallel Threads</label>
                  <Controller
                    name="scan_settings.parallel_threads"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="1"
                        max="20"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="form-input"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Scan Types */}
              <div>
                <label className="form-label">Scan Types</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {[
                    { id: 'schema_discovery', label: 'Schema Discovery' },
                    { id: 'data_profiling', label: 'Data Profiling' },
                    { id: 'sensitivity_detection', label: 'Sensitivity Detection' },
                    { id: 'quality_assessment', label: 'Quality Assessment' },
                    { id: 'lineage_mapping', label: 'Lineage Mapping' },
                  ].map((scanType) => (
                    <div key={scanType.id} className="flex items-center space-x-2">
                      <Controller
                        name="scan_settings.scan_types"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            checked={field.value.includes(scanType.id)}
                            onChange={(e) => {
                              const newValue = e.target.checked
                                ? [...field.value, scanType.id]
                                : field.value.filter(type => type !== scanType.id);
                              field.onChange(newValue);
                            }}
                            className="rounded border-border"
                          />
                        )}
                      />
                      <label className="text-sm">{scanType.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Metadata & Tags */}
        {currentStep === 4 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Metadata & Tags</h3>
              <p className="text-sm text-muted-foreground">
                Add metadata and tags to help organize and manage this data source
              </p>
            </div>
            <div className="card-content space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Business Owner</label>
                  <Controller
                    name="metadata.business_owner"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="e.g., John Smith"
                        className="form-input"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="form-label">Technical Owner</label>
                  <Controller
                    name="metadata.technical_owner"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="e.g., jane.doe@company.com"
                        className="form-input"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Department</label>
                  <Controller
                    name="metadata.department"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="e.g., Engineering, Sales"
                        className="form-input"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="form-label">Cost Center</label>
                  <Controller
                    name="metadata.cost_center"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="e.g., CC-001"
                        className="form-input"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="form-label">Tags</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add a tag..."
                      className="form-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="btn-outline btn-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {watchedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watchedTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="btn-outline"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isEditing ? 'Update' : 'Create'} Data Source</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}