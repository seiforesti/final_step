/**
 * 🌊 Streaming Orchestration APIs - Advanced Scan Logic
 * =====================================================
 * 
 * Comprehensive API integration for streaming orchestration operations
 * Maps to: backend/api/routes/streaming_orchestration_routes.py
 * 
 * Features:
 * - Advanced streaming workflow orchestration
 * - Real-time event coordination and routing
 * - Cross-system streaming integration
 * - Intelligent stream processing pipelines
 * - Advanced monitoring and analytics
 * - Dynamic scaling and load balancing
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import { ApiClient } from '@/lib/api-client';
import {
  StreamConfiguration,
  StreamPipeline,
  StreamProcessingConfig,
  StreamAnalytics,
  RealTimeEvent,
  EventCoordination,
  StreamingWorkflow,
  StreamMetrics,
  StreamHealth,
  StreamingOrchestration,
  StreamProcessor,
  EventRouter,
  StreamCoordinator,
  StreamingInsight
} from '../types/streaming.types';

/**
 * API endpoints configuration mapping to backend routes
 */
const API_BASE = '/api/v1/streaming-orchestration';

const ENDPOINTS = {
  // Stream creation and management
  CREATE_STREAMING_PIPELINE: `${API_BASE}/streams/create`,
  UPDATE_STREAM_CONFIG: `${API_BASE}/streams/update`,
  DELETE_STREAM: `${API_BASE}/streams/delete`,
  GET_STREAM_STATUS: `${API_BASE}/streams/status`,
  
  // Stream operations
  START_STREAM: `${API_BASE}/streams/start`,
  STOP_STREAM: `${API_BASE}/streams/stop`,
  PAUSE_STREAM: `${API_BASE}/streams/pause`,
  RESUME_STREAM: `${API_BASE}/streams/resume`,
  
  // Event coordination
  COORDINATE_EVENTS: `${API_BASE}/events/coordinate`,
  ROUTE_EVENTS: `${API_BASE}/events/route`,
  FILTER_EVENTS: `${API_BASE}/events/filter`,
  TRANSFORM_EVENTS: `${API_BASE}/events/transform`,
  
  // Stream processing
  CREATE_PROCESSOR: `${API_BASE}/processors/create`,
  UPDATE_PROCESSOR: `${API_BASE}/processors/update`,
  GET_PROCESSOR_STATUS: `${API_BASE}/processors/status`,
  SCALE_PROCESSOR: `${API_BASE}/processors/scale`,
  
  // Orchestration management
  CREATE_ORCHESTRATION: `${API_BASE}/orchestration/create`,
  UPDATE_ORCHESTRATION: `${API_BASE}/orchestration/update`,
  GET_ORCHESTRATION_STATUS: `${API_BASE}/orchestration/status`,
  EXECUTE_ORCHESTRATION: `${API_BASE}/orchestration/execute`,
  
  // Monitoring and analytics
  GET_STREAM_METRICS: `${API_BASE}/monitoring/metrics`,
  GET_STREAM_ANALYTICS: `${API_BASE}/monitoring/analytics`,
  GET_PERFORMANCE_INSIGHTS: `${API_BASE}/monitoring/insights`,
  GET_STREAM_HEALTH: `${API_BASE}/monitoring/health`,
  
  // Cross-system integration
  INTEGRATE_SYSTEMS: `${API_BASE}/integration/systems`,
  COORDINATE_CROSS_STREAM: `${API_BASE}/integration/coordinate`,
  SYNC_STREAM_STATES: `${API_BASE}/integration/sync`,
  MANAGE_DEPENDENCIES: `${API_BASE}/integration/dependencies`,
  
  // Advanced features
  CONFIGURE_AUTO_SCALING: `${API_BASE}/advanced/auto-scaling`,
  SETUP_LOAD_BALANCING: `${API_BASE}/advanced/load-balancing`,
  ENABLE_FAULT_TOLERANCE: `${API_BASE}/advanced/fault-tolerance`,
  CONFIGURE_BACKPRESSURE: `${API_BASE}/advanced/backpressure`,
  
  // Real-time streaming
  STREAM_EVENTS: `${API_BASE}/realtime/events`,
  STREAM_METRICS: `${API_BASE}/realtime/metrics`,
  STREAM_ALERTS: `${API_BASE}/realtime/alerts`,
  STREAM_STATUS_UPDATES: `${API_BASE}/realtime/status`
} as const;

/**
 * Streaming Orchestration API Service Class
 * Provides comprehensive integration with streaming orchestration backend
 */
export class StreamingOrchestrationAPIService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  // ==================== Stream Creation and Management ====================

  /**
   * Create streaming pipeline with enterprise orchestration
   */
  async createStreamingPipeline(
    pipelineConfig: {
      stream_type: string;
      processing_mode: string;
      data_sources: Record<string, any>;
      processing_stages: Array<Record<string, any>>;
      target_systems?: string[];
      scaling_config?: Record<string, any>;
      batch_size?: number;
      parallelism?: number;
    }
  ): Promise<StreamPipeline> {
    try {
      const response = await this.apiClient.post<StreamPipeline>(
        ENDPOINTS.CREATE_STREAMING_PIPELINE,
        pipelineConfig
      );

      return {
        ...response,
        pipeline_id: response.pipeline_id || `pipeline_${Date.now()}`,
        status: response.status || 'created',
        creation_timestamp: response.creation_timestamp || new Date().toISOString(),
        stream_config: response.stream_config || {}
      };
    } catch (error) {
      console.error('Error creating streaming pipeline:', error);
      throw new Error(`Failed to create streaming pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update stream configuration
   */
  async updateStreamConfiguration(
    streamId: string,
    configUpdate: Partial<StreamConfiguration>
  ): Promise<StreamConfiguration> {
    try {
      const response = await this.apiClient.patch<StreamConfiguration>(
        `${ENDPOINTS.UPDATE_STREAM_CONFIG}/${streamId}`,
        configUpdate
      );

      return {
        ...response,
        config_id: response.config_id || `config_${Date.now()}`,
        update_timestamp: response.update_timestamp || new Date().toISOString(),
        version: response.version || '1.0.0'
      };
    } catch (error) {
      console.error('Error updating stream configuration:', error);
      throw new Error(`Failed to update stream configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete streaming pipeline
   */
  async deleteStream(
    streamId: string,
    graceful: boolean = true
  ): Promise<{ success: boolean; timestamp: string }> {
    try {
      const response = await this.apiClient.delete<{ success: boolean; timestamp: string }>(
        `${ENDPOINTS.DELETE_STREAM}/${streamId}`,
        { params: { graceful } }
      );

      return {
        success: response.success || false,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error deleting stream:', error);
      throw new Error(`Failed to delete stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get stream status
   */
  async getStreamStatus(
    streamId?: string
  ): Promise<StreamPipeline[]> {
    try {
      const response = await this.apiClient.get<StreamPipeline[]>(
        ENDPOINTS.GET_STREAM_STATUS,
        { params: { stream_id: streamId } }
      );

      return response.map(stream => ({
        ...stream,
        status_timestamp: stream.status_timestamp || new Date().toISOString(),
        uptime: stream.uptime || 0,
        throughput: stream.throughput || 0
      }));
    } catch (error) {
      console.error('Error getting stream status:', error);
      throw new Error(`Failed to get stream status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Stream Operations ====================

  /**
   * Start streaming pipeline
   */
  async startStream(
    streamId: string,
    startConfig?: {
      checkpoint_id?: string;
      parallelism?: number;
      resource_allocation?: Record<string, any>;
    }
  ): Promise<{ stream_id: string; status: string; start_timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ stream_id: string; status: string; start_timestamp: string }>(
        `${ENDPOINTS.START_STREAM}/${streamId}`,
        startConfig
      );

      return {
        stream_id: response.stream_id || streamId,
        status: response.status || 'starting',
        start_timestamp: response.start_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error starting stream:', error);
      throw new Error(`Failed to start stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop streaming pipeline
   */
  async stopStream(
    streamId: string,
    stopConfig?: {
      graceful?: boolean;
      save_checkpoint?: boolean;
      timeout_seconds?: number;
    }
  ): Promise<{ stream_id: string; status: string; stop_timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ stream_id: string; status: string; stop_timestamp: string }>(
        `${ENDPOINTS.STOP_STREAM}/${streamId}`,
        stopConfig
      );

      return {
        stream_id: response.stream_id || streamId,
        status: response.status || 'stopping',
        stop_timestamp: response.stop_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error stopping stream:', error);
      throw new Error(`Failed to stop stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Pause streaming pipeline
   */
  async pauseStream(
    streamId: string,
    pauseConfig?: {
      save_state?: boolean;
      pause_reason?: string;
    }
  ): Promise<{ stream_id: string; status: string; pause_timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ stream_id: string; status: string; pause_timestamp: string }>(
        `${ENDPOINTS.PAUSE_STREAM}/${streamId}`,
        pauseConfig
      );

      return {
        stream_id: response.stream_id || streamId,
        status: response.status || 'paused',
        pause_timestamp: response.pause_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error pausing stream:', error);
      throw new Error(`Failed to pause stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Resume streaming pipeline
   */
  async resumeStream(
    streamId: string,
    resumeConfig?: {
      restore_state?: boolean;
      checkpoint_id?: string;
    }
  ): Promise<{ stream_id: string; status: string; resume_timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ stream_id: string; status: string; resume_timestamp: string }>(
        `${ENDPOINTS.RESUME_STREAM}/${streamId}`,
        resumeConfig
      );

      return {
        stream_id: response.stream_id || streamId,
        status: response.status || 'running',
        resume_timestamp: response.resume_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error resuming stream:', error);
      throw new Error(`Failed to resume stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Event Coordination ====================

  /**
   * Coordinate events across streams
   */
  async coordinateEvents(
    coordinationConfig: {
      event_types: string[];
      coordination_strategy: string;
      target_streams: string[];
      priority_rules?: Record<string, any>;
    }
  ): Promise<EventCoordination> {
    try {
      const response = await this.apiClient.post<EventCoordination>(
        ENDPOINTS.COORDINATE_EVENTS,
        coordinationConfig
      );

      return {
        ...response,
        coordination_id: response.coordination_id || `coord_${Date.now()}`,
        status: response.status || 'active',
        coordination_timestamp: response.coordination_timestamp || new Date().toISOString(),
        coordinated_events: response.coordinated_events || 0
      };
    } catch (error) {
      console.error('Error coordinating events:', error);
      throw new Error(`Failed to coordinate events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Route events to appropriate streams
   */
  async routeEvents(
    routingConfig: {
      routing_rules: Array<{
        condition: Record<string, any>;
        target_stream: string;
        transformation?: Record<string, any>;
      }>;
      default_route?: string;
      load_balancing?: boolean;
    }
  ): Promise<EventRouter> {
    try {
      const response = await this.apiClient.post<EventRouter>(
        ENDPOINTS.ROUTE_EVENTS,
        routingConfig
      );

      return {
        ...response,
        router_id: response.router_id || `router_${Date.now()}`,
        status: response.status || 'active',
        routing_timestamp: response.routing_timestamp || new Date().toISOString(),
        routed_events: response.routed_events || 0
      };
    } catch (error) {
      console.error('Error routing events:', error);
      throw new Error(`Failed to route events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Filter events based on criteria
   */
  async filterEvents(
    filterConfig: {
      filter_criteria: Record<string, any>;
      filter_type: 'include' | 'exclude' | 'transform';
      target_streams?: string[];
    }
  ): Promise<{ filter_id: string; filtered_events: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ filter_id: string; filtered_events: number; timestamp: string }>(
        ENDPOINTS.FILTER_EVENTS,
        filterConfig
      );

      return {
        filter_id: response.filter_id || `filter_${Date.now()}`,
        filtered_events: response.filtered_events || 0,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error filtering events:', error);
      throw new Error(`Failed to filter events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transform events during processing
   */
  async transformEvents(
    transformConfig: {
      transformation_rules: Array<{
        source_field: string;
        target_field: string;
        transformation_type: string;
        parameters?: Record<string, any>;
      }>;
      target_streams?: string[];
    }
  ): Promise<{ transform_id: string; transformed_events: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ transform_id: string; transformed_events: number; timestamp: string }>(
        ENDPOINTS.TRANSFORM_EVENTS,
        transformConfig
      );

      return {
        transform_id: response.transform_id || `transform_${Date.now()}`,
        transformed_events: response.transformed_events || 0,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error transforming events:', error);
      throw new Error(`Failed to transform events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Stream Processing ====================

  /**
   * Create stream processor
   */
  async createStreamProcessor(
    processorConfig: {
      processor_type: string;
      processing_logic: Record<string, any>;
      input_streams: string[];
      output_streams: string[];
      parallelism?: number;
      resources?: Record<string, any>;
    }
  ): Promise<StreamProcessor> {
    try {
      const response = await this.apiClient.post<StreamProcessor>(
        ENDPOINTS.CREATE_PROCESSOR,
        processorConfig
      );

      return {
        ...response,
        processor_id: response.processor_id || `processor_${Date.now()}`,
        status: response.status || 'created',
        creation_timestamp: response.creation_timestamp || new Date().toISOString(),
        processed_events: response.processed_events || 0
      };
    } catch (error) {
      console.error('Error creating stream processor:', error);
      throw new Error(`Failed to create stream processor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update stream processor
   */
  async updateStreamProcessor(
    processorId: string,
    processorUpdate: Partial<StreamProcessor>
  ): Promise<StreamProcessor> {
    try {
      const response = await this.apiClient.patch<StreamProcessor>(
        `${ENDPOINTS.UPDATE_PROCESSOR}/${processorId}`,
        processorUpdate
      );

      return {
        ...response,
        update_timestamp: response.update_timestamp || new Date().toISOString(),
        version: response.version || '1.0.0'
      };
    } catch (error) {
      console.error('Error updating stream processor:', error);
      throw new Error(`Failed to update stream processor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get processor status
   */
  async getProcessorStatus(
    processorId?: string
  ): Promise<StreamProcessor[]> {
    try {
      const response = await this.apiClient.get<StreamProcessor[]>(
        ENDPOINTS.GET_PROCESSOR_STATUS,
        { params: { processor_id: processorId } }
      );

      return response.map(processor => ({
        ...processor,
        status_timestamp: processor.status_timestamp || new Date().toISOString(),
        throughput: processor.throughput || 0,
        latency_ms: processor.latency_ms || 0
      }));
    } catch (error) {
      console.error('Error getting processor status:', error);
      throw new Error(`Failed to get processor status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Scale stream processor
   */
  async scaleStreamProcessor(
    processorId: string,
    scalingConfig: {
      target_parallelism: number;
      scaling_strategy: 'immediate' | 'gradual';
      resource_adjustment?: Record<string, any>;
    }
  ): Promise<{ scaling_id: string; target_parallelism: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ scaling_id: string; target_parallelism: number; timestamp: string }>(
        `${ENDPOINTS.SCALE_PROCESSOR}/${processorId}`,
        scalingConfig
      );

      return {
        scaling_id: response.scaling_id || `scaling_${Date.now()}`,
        target_parallelism: response.target_parallelism || scalingConfig.target_parallelism,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error scaling stream processor:', error);
      throw new Error(`Failed to scale stream processor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Orchestration Management ====================

  /**
   * Create streaming orchestration
   */
  async createStreamingOrchestration(
    orchestrationConfig: {
      orchestration_name: string;
      streams: string[];
      processors: string[];
      coordination_rules: Record<string, any>;
      execution_order?: string[];
      dependencies?: Record<string, string[]>;
    }
  ): Promise<StreamingOrchestration> {
    try {
      const response = await this.apiClient.post<StreamingOrchestration>(
        ENDPOINTS.CREATE_ORCHESTRATION,
        orchestrationConfig
      );

      return {
        ...response,
        orchestration_id: response.orchestration_id || `orch_${Date.now()}`,
        status: response.status || 'created',
        creation_timestamp: response.creation_timestamp || new Date().toISOString(),
        execution_count: response.execution_count || 0
      };
    } catch (error) {
      console.error('Error creating streaming orchestration:', error);
      throw new Error(`Failed to create streaming orchestration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update streaming orchestration
   */
  async updateStreamingOrchestration(
    orchestrationId: string,
    orchestrationUpdate: Partial<StreamingOrchestration>
  ): Promise<StreamingOrchestration> {
    try {
      const response = await this.apiClient.patch<StreamingOrchestration>(
        `${ENDPOINTS.UPDATE_ORCHESTRATION}/${orchestrationId}`,
        orchestrationUpdate
      );

      return {
        ...response,
        update_timestamp: response.update_timestamp || new Date().toISOString(),
        version: response.version || '1.0.0'
      };
    } catch (error) {
      console.error('Error updating streaming orchestration:', error);
      throw new Error(`Failed to update streaming orchestration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get orchestration status
   */
  async getOrchestrationStatus(
    orchestrationId?: string
  ): Promise<StreamingOrchestration[]> {
    try {
      const response = await this.apiClient.get<StreamingOrchestration[]>(
        ENDPOINTS.GET_ORCHESTRATION_STATUS,
        { params: { orchestration_id: orchestrationId } }
      );

      return response.map(orchestration => ({
        ...orchestration,
        status_timestamp: orchestration.status_timestamp || new Date().toISOString(),
        active_streams: orchestration.active_streams || 0,
        total_throughput: orchestration.total_throughput || 0
      }));
    } catch (error) {
      console.error('Error getting orchestration status:', error);
      throw new Error(`Failed to get orchestration status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute streaming orchestration
   */
  async executeStreamingOrchestration(
    orchestrationId: string,
    executionConfig?: {
      execution_mode: 'sequential' | 'parallel' | 'conditional';
      resource_allocation?: Record<string, any>;
      monitoring_level?: 'basic' | 'detailed' | 'comprehensive';
    }
  ): Promise<{ execution_id: string; status: string; start_timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ execution_id: string; status: string; start_timestamp: string }>(
        `${ENDPOINTS.EXECUTE_ORCHESTRATION}/${orchestrationId}`,
        executionConfig
      );

      return {
        execution_id: response.execution_id || `exec_${Date.now()}`,
        status: response.status || 'executing',
        start_timestamp: response.start_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error executing streaming orchestration:', error);
      throw new Error(`Failed to execute streaming orchestration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Monitoring and Analytics ====================

  /**
   * Get stream metrics
   */
  async getStreamMetrics(
    metricsRequest?: {
      stream_ids?: string[];
      metrics: string[];
      timeRange?: { start: string; end: string };
      granularity?: string;
    }
  ): Promise<StreamMetrics> {
    try {
      const response = await this.apiClient.get<StreamMetrics>(
        ENDPOINTS.GET_STREAM_METRICS,
        { params: metricsRequest }
      );

      return {
        ...response,
        metrics_id: response.metrics_id || `metrics_${Date.now()}`,
        collection_timestamp: response.collection_timestamp || new Date().toISOString(),
        throughput: response.throughput || 0,
        latency_avg: response.latency_avg || 0
      };
    } catch (error) {
      console.error('Error getting stream metrics:', error);
      throw new Error(`Failed to get stream metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get stream analytics
   */
  async getStreamAnalytics(
    analyticsRequest?: {
      analysis_type: string;
      stream_ids?: string[];
      timeRange?: { start: string; end: string };
    }
  ): Promise<StreamAnalytics> {
    try {
      const response = await this.apiClient.get<StreamAnalytics>(
        ENDPOINTS.GET_STREAM_ANALYTICS,
        { params: analyticsRequest }
      );

      return {
        ...response,
        analytics_id: response.analytics_id || `analytics_${Date.now()}`,
        analysis_timestamp: response.analysis_timestamp || new Date().toISOString(),
        insights: response.insights || [],
        recommendations: response.recommendations || []
      };
    } catch (error) {
      console.error('Error getting stream analytics:', error);
      throw new Error(`Failed to get stream analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get performance insights
   */
  async getPerformanceInsights(
    insightsRequest?: {
      stream_ids?: string[];
      insight_types?: string[];
      analysis_depth?: 'basic' | 'detailed' | 'comprehensive';
    }
  ): Promise<StreamingInsight[]> {
    try {
      const response = await this.apiClient.get<StreamingInsight[]>(
        ENDPOINTS.GET_PERFORMANCE_INSIGHTS,
        { params: insightsRequest }
      );

      return response.map(insight => ({
        ...insight,
        insight_id: insight.insight_id || `insight_${Date.now()}_${Math.random()}`,
        confidence_score: insight.confidence_score || 0,
        priority: insight.priority || 'medium',
        generated_timestamp: insight.generated_timestamp || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting performance insights:', error);
      throw new Error(`Failed to get performance insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get stream health status
   */
  async getStreamHealth(
    streamIds?: string[]
  ): Promise<StreamHealth[]> {
    try {
      const response = await this.apiClient.get<StreamHealth[]>(
        ENDPOINTS.GET_STREAM_HEALTH,
        { params: { stream_ids: streamIds } }
      );

      return response.map(health => ({
        ...health,
        health_id: health.health_id || `health_${Date.now()}_${Math.random()}`,
        overall_status: health.overall_status || 'unknown',
        check_timestamp: health.check_timestamp || new Date().toISOString(),
        component_health: health.component_health || {}
      }));
    } catch (error) {
      console.error('Error getting stream health:', error);
      throw new Error(`Failed to get stream health: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Cross-system Integration ====================

  /**
   * Integrate external systems
   */
  async integrateExternalSystems(
    integrationConfig: {
      systems: Array<{
        system_id: string;
        system_type: string;
        connection_config: Record<string, any>;
        integration_patterns: string[];
      }>;
      coordination_strategy?: string;
    }
  ): Promise<{ integration_id: string; integrated_systems: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ integration_id: string; integrated_systems: number; timestamp: string }>(
        ENDPOINTS.INTEGRATE_SYSTEMS,
        integrationConfig
      );

      return {
        integration_id: response.integration_id || `integration_${Date.now()}`,
        integrated_systems: response.integrated_systems || 0,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error integrating external systems:', error);
      throw new Error(`Failed to integrate external systems: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Coordinate cross-stream operations
   */
  async coordinateCrossStream(
    coordinationConfig: {
      source_streams: string[];
      target_streams: string[];
      coordination_type: 'sync' | 'async' | 'event_driven';
      coordination_rules?: Record<string, any>;
    }
  ): Promise<StreamCoordinator> {
    try {
      const response = await this.apiClient.post<StreamCoordinator>(
        ENDPOINTS.COORDINATE_CROSS_STREAM,
        coordinationConfig
      );

      return {
        ...response,
        coordinator_id: response.coordinator_id || `coordinator_${Date.now()}`,
        status: response.status || 'active',
        coordination_timestamp: response.coordination_timestamp || new Date().toISOString(),
        coordinated_operations: response.coordinated_operations || 0
      };
    } catch (error) {
      console.error('Error coordinating cross-stream operations:', error);
      throw new Error(`Failed to coordinate cross-stream operations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Synchronize stream states
   */
  async synchronizeStreamStates(
    syncConfig: {
      streams: string[];
      sync_strategy: 'checkpoint' | 'state_snapshot' | 'event_replay';
      consistency_level?: 'strong' | 'eventual' | 'weak';
    }
  ): Promise<{ sync_id: string; synchronized_streams: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ sync_id: string; synchronized_streams: number; timestamp: string }>(
        ENDPOINTS.SYNC_STREAM_STATES,
        syncConfig
      );

      return {
        sync_id: response.sync_id || `sync_${Date.now()}`,
        synchronized_streams: response.synchronized_streams || 0,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error synchronizing stream states:', error);
      throw new Error(`Failed to synchronize stream states: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Manage stream dependencies
   */
  async manageStreamDependencies(
    dependencyConfig: {
      dependencies: Array<{
        source_stream: string;
        dependent_stream: string;
        dependency_type: 'data' | 'timing' | 'resource';
        conditions?: Record<string, any>;
      }>;
      resolution_strategy?: string;
    }
  ): Promise<{ dependency_id: string; managed_dependencies: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ dependency_id: string; managed_dependencies: number; timestamp: string }>(
        ENDPOINTS.MANAGE_DEPENDENCIES,
        dependencyConfig
      );

      return {
        dependency_id: response.dependency_id || `dep_${Date.now()}`,
        managed_dependencies: response.managed_dependencies || 0,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error managing stream dependencies:', error);
      throw new Error(`Failed to manage stream dependencies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Advanced Features ====================

  /**
   * Configure auto-scaling
   */
  async configureAutoScaling(
    scalingConfig: {
      stream_ids: string[];
      scaling_rules: Array<{
        metric: string;
        threshold: number;
        action: 'scale_up' | 'scale_down';
        parameters: Record<string, any>;
      }>;
      min_parallelism?: number;
      max_parallelism?: number;
    }
  ): Promise<{ scaling_config_id: string; configured_streams: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ scaling_config_id: string; configured_streams: number; timestamp: string }>(
        ENDPOINTS.CONFIGURE_AUTO_SCALING,
        scalingConfig
      );

      return {
        scaling_config_id: response.scaling_config_id || `scaling_${Date.now()}`,
        configured_streams: response.configured_streams || 0,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error configuring auto-scaling:', error);
      throw new Error(`Failed to configure auto-scaling: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Setup load balancing
   */
  async setupLoadBalancing(
    loadBalancingConfig: {
      stream_ids: string[];
      balancing_strategy: 'round_robin' | 'weighted' | 'least_connections' | 'adaptive';
      health_check_config?: Record<string, any>;
      failover_config?: Record<string, any>;
    }
  ): Promise<{ load_balancer_id: string; balanced_streams: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ load_balancer_id: string; balanced_streams: number; timestamp: string }>(
        ENDPOINTS.SETUP_LOAD_BALANCING,
        loadBalancingConfig
      );

      return {
        load_balancer_id: response.load_balancer_id || `lb_${Date.now()}`,
        balanced_streams: response.balanced_streams || 0,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error setting up load balancing:', error);
      throw new Error(`Failed to setup load balancing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enable fault tolerance
   */
  async enableFaultTolerance(
    faultToleranceConfig: {
      stream_ids: string[];
      recovery_strategies: Array<{
        failure_type: string;
        recovery_action: string;
        parameters: Record<string, any>;
      }>;
      checkpoint_interval?: number;
      backup_strategy?: string;
    }
  ): Promise<{ fault_tolerance_id: string; protected_streams: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ fault_tolerance_id: string; protected_streams: number; timestamp: string }>(
        ENDPOINTS.ENABLE_FAULT_TOLERANCE,
        faultToleranceConfig
      );

      return {
        fault_tolerance_id: response.fault_tolerance_id || `ft_${Date.now()}`,
        protected_streams: response.protected_streams || 0,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error enabling fault tolerance:', error);
      throw new Error(`Failed to enable fault tolerance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Configure backpressure handling
   */
  async configureBackpressure(
    backpressureConfig: {
      stream_ids: string[];
      backpressure_strategy: 'buffer' | 'drop' | 'block' | 'adaptive';
      buffer_size?: number;
      threshold_config?: Record<string, any>;
    }
  ): Promise<{ backpressure_config_id: string; configured_streams: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ backpressure_config_id: string; configured_streams: number; timestamp: string }>(
        ENDPOINTS.CONFIGURE_BACKPRESSURE,
        backpressureConfig
      );

      return {
        backpressure_config_id: response.backpressure_config_id || `bp_${Date.now()}`,
        configured_streams: response.configured_streams || 0,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error configuring backpressure:', error);
      throw new Error(`Failed to configure backpressure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Real-time Streaming ====================

  /**
   * Stream real-time events
   */
  async streamRealTimeEvents(
    streamConfig: {
      event_types?: string[];
      filters?: Record<string, any>;
      format?: 'json' | 'avro' | 'protobuf';
    }
  ): Promise<AsyncGenerator<RealTimeEvent, void, unknown>> {
    try {
      const response = await this.apiClient.getStream<RealTimeEvent>(
        ENDPOINTS.STREAM_EVENTS,
        streamConfig
      );

      return response;
    } catch (error) {
      console.error('Error streaming real-time events:', error);
      throw new Error(`Failed to stream real-time events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stream real-time metrics
   */
  async streamRealTimeMetrics(
    metricsConfig: {
      metric_types?: string[];
      stream_ids?: string[];
      update_interval?: number;
    }
  ): Promise<AsyncGenerator<StreamMetrics, void, unknown>> {
    try {
      const response = await this.apiClient.getStream<StreamMetrics>(
        ENDPOINTS.STREAM_METRICS,
        metricsConfig
      );

      return response;
    } catch (error) {
      console.error('Error streaming real-time metrics:', error);
      throw new Error(`Failed to stream real-time metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stream real-time alerts
   */
  async streamRealTimeAlerts(
    alertConfig: {
      alert_types?: string[];
      severity_levels?: string[];
      stream_ids?: string[];
    }
  ): Promise<AsyncGenerator<Record<string, any>, void, unknown>> {
    try {
      const response = await this.apiClient.getStream<Record<string, any>>(
        ENDPOINTS.STREAM_ALERTS,
        alertConfig
      );

      return response;
    } catch (error) {
      console.error('Error streaming real-time alerts:', error);
      throw new Error(`Failed to stream real-time alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stream status updates
   */
  async streamStatusUpdates(
    statusConfig: {
      component_types?: string[];
      update_frequency?: number;
      include_details?: boolean;
    }
  ): Promise<AsyncGenerator<Record<string, any>, void, unknown>> {
    try {
      const response = await this.apiClient.getStream<Record<string, any>>(
        ENDPOINTS.STREAM_STATUS_UPDATES,
        statusConfig
      );

      return response;
    } catch (error) {
      console.error('Error streaming status updates:', error);
      throw new Error(`Failed to stream status updates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Utility Methods ====================

  /**
   * Health check for streaming orchestration service
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; services: Record<string, string> }> {
    try {
      const response = await this.apiClient.get<{ status: string; timestamp: string; services: Record<string, string> }>(
        `${API_BASE}/health`
      );

      return {
        status: response.status || 'unknown',
        timestamp: response.timestamp || new Date().toISOString(),
        services: response.services || {}
      };
    } catch (error) {
      console.error('Error checking streaming orchestration service health:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        services: { streaming_orchestration: 'error' }
      };
    }
  }

  /**
   * Get service capabilities
   */
  async getServiceCapabilities(): Promise<Record<string, any>> {
    try {
      const response = await this.apiClient.get<Record<string, any>>(
        `${API_BASE}/capabilities`
      );

      return {
        ...response,
        capabilities_timestamp: response.capabilities_timestamp || new Date().toISOString(),
        supported_features: response.supported_features || [],
        service_version: response.service_version || '1.0.0'
      };
    } catch (error) {
      console.error('Error getting streaming orchestration service capabilities:', error);
      throw new Error(`Failed to get streaming orchestration service capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const streamingOrchestrationAPI = new StreamingOrchestrationAPIService();

// Export individual methods for tree-shaking
export const {
  createStreamingPipeline,
  updateStreamConfiguration,
  deleteStream,
  getStreamStatus,
  startStream,
  stopStream,
  pauseStream,
  resumeStream,
  coordinateEvents,
  routeEvents,
  filterEvents,
  transformEvents,
  createStreamProcessor,
  updateStreamProcessor,
  getProcessorStatus,
  scaleStreamProcessor,
  createStreamingOrchestration,
  updateStreamingOrchestration,
  getOrchestrationStatus,
  executeStreamingOrchestration,
  getStreamMetrics,
  getStreamAnalytics,
  getPerformanceInsights,
  getStreamHealth,
  integrateExternalSystems,
  coordinateCrossStream,
  synchronizeStreamStates,
  manageStreamDependencies,
  configureAutoScaling,
  setupLoadBalancing,
  enableFaultTolerance,
  configureBackpressure,
  streamRealTimeEvents,
  streamRealTimeMetrics,
  streamRealTimeAlerts,
  streamStatusUpdates,
  healthCheck,
  getServiceCapabilities
} = streamingOrchestrationAPI;

export default streamingOrchestrationAPI;