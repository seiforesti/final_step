/**
 * Streaming and Integration Types - Real-time Processing and System Integration
 * ============================================================================
 *
 * This file contains comprehensive TypeScript type definitions for real-time streaming,
 * event processing, system integration, and advanced data connectors.
 */

import { ISODateString, UUID } from './racine-core.types';

// =============================================================================
// REAL-TIME STREAMING TYPES
// =============================================================================

export interface StreamingConfiguration {
  streams: DataStream[];
  processors: StreamProcessor[];
  pipelines: StreamingPipeline[];
  consumers: StreamConsumer[];
  monitoring: StreamMonitoring;
}

export interface DataStream {
  id: string;
  name: string;
  type: "kafka" | "kinesis" | "pulsar" | "rabbitmq" | "custom";
  configuration: {
    brokers: string[];
    topics: string[];
    partitions: number;
    replication: number;
    retention: number; // hours
  };
  schema: {
    format: "avro" | "json" | "protobuf" | "custom";
    definition: Record<string, any>;
    evolution: "backward" | "forward" | "full" | "none";
  };
  security: {
    encryption: boolean;
    authentication: Record<string, any>;
    authorization: string[];
  };
  metrics: StreamMetrics;
}

export interface StreamProcessor {
  id: string;
  name: string;
  type: "filter" | "transform" | "aggregate" | "enrich" | "validate" | "custom";
  inputStreams: string[];
  outputStreams: string[];
  configuration: {
    processingMode: "at_least_once" | "exactly_once" | "at_most_once";
    windowType: "tumbling" | "sliding" | "session" | "global";
    windowSize: number; // seconds
    parallelism: number;
  };
  code: {
    language: "sql" | "python" | "scala" | "java" | "javascript";
    source: string;
    dependencies: string[];
  };
  checkpointing: {
    enabled: boolean;
    interval: number; // seconds
    storage: "memory" | "disk" | "distributed";
  };
}

export interface StreamingPipeline {
  id: string;
  name: string;
  description: string;
  processors: string[];
  topology: PipelineTopology;
  deployment: {
    environment: "development" | "staging" | "production";
    resources: ResourceRequirements;
    scaling: AutoScalingConfig;
  };
  monitoring: PipelineMonitoring;
  status: "stopped" | "starting" | "running" | "stopping" | "failed";
}

export interface PipelineTopology {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  parallelism: Record<string, number>;
  dependencies: Record<string, string[]>;
}

export interface TopologyNode {
  id: string;
  type: "source" | "processor" | "sink";
  configuration: Record<string, any>;
  position: { x: number; y: number };
}

export interface TopologyEdge {
  source: string;
  target: string;
  partitioning: "round_robin" | "hash" | "broadcast" | "custom";
  configuration: Record<string, any>;
}

export interface ResourceRequirements {
  cpu: number; // cores
  memory: number; // GB
  storage: number; // GB
  network: number; // Mbps
}

export interface AutoScalingConfig {
  enabled: boolean;
  minInstances: number;
  maxInstances: number;
  targetUtilization: number; // percentage
  scaleUpCooldown: number; // seconds
  scaleDownCooldown: number; // seconds
  metrics: string[];
}

export interface PipelineMonitoring {
  enabled: boolean;
  metrics: string[];
  alertRules: string[];
  dashboards: string[];
  logging: {
    level: "debug" | "info" | "warning" | "error";
    retention: number; // days
    structured: boolean;
  };
}

export interface StreamConsumer {
  id: string;
  name: string;
  streamId: string;
  consumerGroup: string;
  configuration: {
    autoCommit: boolean;
    batchSize: number;
    maxPollInterval: number;
    sessionTimeout: number;
  };
  processing: {
    handler: string;
    errorHandling: "skip" | "retry" | "dead_letter";
    maxRetries: number;
    retryDelay: number;
  };
  status: "active" | "inactive" | "error";
  metrics: ConsumerMetrics;
}

export interface StreamMetrics {
  throughput: {
    messagesPerSecond: number;
    bytesPerSecond: number;
    peakThroughput: number;
  };
  latency: {
    average: number;
    p95: number;
    p99: number;
  };
  errors: {
    count: number;
    rate: number;
    types: Record<string, number>;
  };
  backlog: {
    size: number;
    oldestMessage: ISODateString;
    estimatedProcessingTime: number;
  };
}

export interface ConsumerMetrics {
  lag: number;
  throughput: number;
  errors: number;
  lastProcessed: ISODateString;
  processing: {
    average: number;
    p95: number;
    p99: number;
  };
}

export interface StreamMonitoring {
  dashboards: string[];
  alerts: string[];
  healthChecks: HealthCheck[];
  sla: {
    availability: number;
    latency: number;
    throughput: number;
  };
}

export interface HealthCheck {
  id: string;
  name: string;
  type: "connectivity" | "throughput" | "latency" | "error_rate" | "custom";
  configuration: Record<string, any>;
  schedule: string;
  timeout: number;
  enabled: boolean;
  lastRun?: ISODateString;
  status: "passing" | "failing" | "unknown";
}

// =============================================================================
// ADVANCED INTEGRATION TYPES
// =============================================================================

export interface IntegrationHub {
  connectors: DataConnector[];
  integrations: SystemIntegration[];
  apis: APIEndpoint[];
  webhooks: WebhookConfiguration[];
  transformations: DataTransformation[];
  mappings: SchemaMapping[];
}

export interface DataConnector {
  id: string;
  name: string;
  type:
    | "database"
    | "file_system"
    | "cloud_storage"
    | "api"
    | "streaming"
    | "custom";
  vendor: string;
  version: string;
  configuration: ConnectorConfiguration;
  status: "connected" | "disconnected" | "error" | "configuring";
  capabilities: ConnectorCapability[];
  metrics: ConnectorMetrics;
  lastSync: ISODateString;
  syncSchedule: string;
}

export interface ConnectorConfiguration {
  connection: Record<string, any>;
  authentication: {
    type: "basic" | "oauth" | "api_key" | "certificate" | "custom";
    credentials: Record<string, any>;
    encryption: boolean;
  };
  sync: {
    mode: "full" | "incremental" | "real_time";
    batchSize: number;
    parallelism: number;
    errorHandling: "skip" | "retry" | "fail";
  };
  filters: {
    include: string[];
    exclude: string[];
    conditions: Record<string, any>;
  };
}

export interface ConnectorCapability {
  feature:
    | "read"
    | "write"
    | "schema_discovery"
    | "incremental_sync"
    | "real_time"
    | "bulk_operations";
  supported: boolean;
  limitations?: string[];
}

export interface ConnectorMetrics {
  recordsProcessed: number;
  bytesTransferred: number;
  averageLatency: number;
  errorRate: number;
  uptime: number;
  lastError?: {
    timestamp: ISODateString;
    message: string;
    code: string;
  };
}

export interface SystemIntegration {
  id: string;
  name: string;
  type:
    | "bi_tool"
    | "ml_platform"
    | "workflow_engine"
    | "notification_service"
    | "external_api";
  endpoint: string;
  authentication: Record<string, any>;
  configuration: Record<string, any>;
  status: "active" | "inactive" | "error";
  lastHeartbeat: ISODateString;
  metrics: {
    requestCount: number;
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
  };
}

export interface APIEndpoint {
  id: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  description: string;
  version: string;
  authentication: string[];
  rateLimit: {
    requests: number;
    window: number; // seconds
    burst: number;
  };
  caching: {
    enabled: boolean;
    ttl: number; // seconds
    strategy: "memory" | "redis" | "cdn";
  };
  monitoring: {
    enabled: boolean;
    alertThresholds: Record<string, number>;
    logging: "minimal" | "detailed" | "debug";
  };
}

export interface WebhookConfiguration {
  id: string;
  name: string;
  url: string;
  events: string[];
  authentication: {
    type: "none" | "basic" | "bearer" | "signature";
    configuration: Record<string, any>;
  };
  retry: {
    enabled: boolean;
    maxAttempts: number;
    backoffStrategy: "linear" | "exponential";
  };
  filtering: {
    enabled: boolean;
    conditions: Record<string, any>;
  };
  status: "active" | "inactive" | "error";
  lastDelivery?: ISODateString;
  metrics: {
    deliveries: number;
    failures: number;
    averageResponseTime: number;
  };
}

export interface DataTransformation {
  id: string;
  name: string;
  type:
    | "mapping"
    | "aggregation"
    | "filtering"
    | "enrichment"
    | "validation"
    | "custom";
  sourceSchema: string;
  targetSchema: string;
  rules: TransformationRule[];
  testing: {
    enabled: boolean;
    sampleData: any[];
    validations: ValidationRule[];
  };
  performance: {
    throughput: number;
    latency: number;
    resourceUsage: Record<string, number>;
  };
}

export interface TransformationRule {
  id: string;
  type:
    | "field_mapping"
    | "value_transformation"
    | "conditional_logic"
    | "aggregation"
    | "custom";
  configuration: Record<string, any>;
  order: number;
  enabled: boolean;
}

export interface ValidationRule {
  field: string;
  type: "required" | "type" | "format" | "range" | "custom";
  parameters: Record<string, any>;
  severity: "warning" | "error";
}

export interface SchemaMapping {
  id: string;
  name: string;
  sourceSchema: SchemaDefinition;
  targetSchema: SchemaDefinition;
  mappings: FieldMapping[];
  confidence: number;
  automatic: boolean;
  lastUpdated: ISODateString;
}

export interface SchemaDefinition {
  name: string;
  version: string;
  fields: SchemaField[];
  metadata: Record<string, any>;
}

export interface SchemaField {
  name: string;
  type: string;
  nullable: boolean;
  description?: string;
  constraints?: Record<string, any>;
  tags?: string[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  confidence: number;
  manual: boolean;
}