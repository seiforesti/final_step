/**
 * Racine Activity Tracking API Service
 * =====================================
 * 
 * Comprehensive API service for activity tracking functionality that maps 100%
 * to the backend RacineActivityService and provides comprehensive monitoring
 * of user actions, system events, and cross-group activities.
 * 
 * Features:
 * - Real-time activity logging and streaming
 * - Cross-group activity correlation and analysis
 * - Comprehensive audit trails for compliance
 * - Advanced filtering and search capabilities
 * - Visual analytics with timelines and heatmaps
 * - Anomaly detection and alerting
 * - Role-based access to activity data
 * - Export and reporting functionality
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/racine_services/racine_activity_service.py
 * - Routes: backend/scripts_automation/app/api/routes/racine_routes/racine_activity_routes.py
 * - Models: backend/scripts_automation/app/models/racine_models/racine_activity_models.py
 */

import {
  APIResponse,
  CreateActivityRequest,
  ActivityResponse,
  ActivityListResponse,
  ActivityAnalyticsRequest,
  ActivityAnalyticsResponse,
  AuditTrailRequest,
  AuditTrailResponse,
  ActivitySearchRequest,
  ActivitySearchResponse,
  UUID,
  ISODateString,
  PaginationRequest,
  FilterRequest,
  SortRequest,
  ActivityCorrelationRequest,
  ActivityCorrelationResponse,
  ActivitySessionResponse,
  ActivityReportRequest,
  ActivityReportResponse,
  AdvancedActivitySearchRequest,
  ActivitySystemHealthResponse,
  ActivitySystemStatsResponse
} from '../types/api.types';

import {
  ActivityRecord,
  AuditTrail,
  ActivityAnalytics,
  ActivityFilter,
  ActivityCorrelation,
  ActivityAnomaly,
  CrossGroupActivity,
  UserActivity,
  SystemActivity,
  ComplianceActivity
} from '../types/racine-core.types';
import { withGracefulErrorHandling, DefaultApiResponses } from '../../lib copie/api-error-handler';

/**
 * Configuration for the activity tracking API service
 */
interface ActivityAPIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableRealTimeStreaming: boolean;
  enableAnomalyDetection: boolean;
  batchSize: number;
  websocketURL?: string;
  streamingBufferSize: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ActivityAPIConfig = {
  baseURL: (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || '/api/proxy',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableRealTimeStreaming: true,
  enableAnomalyDetection: true,
  batchSize: 50,
  websocketURL: (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_WS_URL) || 'ws://localhost:8000/ws',
  streamingBufferSize: 100
};

/**
 * Activity event types for real-time streaming
 */
export enum ActivityEventType {
  ACTIVITY_LOGGED = 'activity_logged',
  BATCH_PROCESSED = 'batch_processed',
  ANOMALY_DETECTED = 'anomaly_detected',
  CORRELATION_FOUND = 'correlation_found',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  PATTERN_DETECTED = 'pattern_detected',
  THRESHOLD_EXCEEDED = 'threshold_exceeded'
}

/**
 * Activity severity levels
 */
export enum ActivitySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Activity categories
 */
export enum ActivityCategory {
  USER_ACTION = 'user_action',
  SYSTEM_EVENT = 'system_event',
  SECURITY_EVENT = 'security_event',
  COMPLIANCE_EVENT = 'compliance_event',
  WORKFLOW_EVENT = 'workflow_event',
  PIPELINE_EVENT = 'pipeline_event',
  AI_EVENT = 'ai_event',
  CROSS_GROUP_EVENT = 'cross_group_event'
}

/**
 * Activity streaming interface
 */
export interface ActivityStreamEvent {
  type: ActivityEventType;
  activity: ActivityRecord;
  timestamp: ISODateString;
  metadata?: Record<string, any>;
}

/**
 * Activity stream handler
 */
export type ActivityStreamHandler = (event: ActivityStreamEvent) => void;

/**
 * Main Activity Tracking API Service Class
 */
class ActivityTrackingAPI {
  private config: ActivityAPIConfig;
  private authToken: string | null = null;
  private websocket: WebSocket | null = null;
  private streamHandlers: Set<ActivityStreamHandler> = new Set();
  private activityBuffer: ActivityRecord[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: Partial<ActivityAPIConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // =============================================================================
  // AUTHENTICATION AND INITIALIZATION
  // =============================================================================

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Initialize activity streaming
   */
  async initializeStreaming(): Promise<void> {
    if (!this.config.enableRealTimeStreaming || !this.config.websocketURL) {
      return;
    }

    try {
      this.websocket = new WebSocket(`${this.config.websocketURL}/activity-stream`);
      
      this.websocket.onopen = () => {
        console.log('Activity tracking WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.websocket.onmessage = (event) => {
        try {
          const streamEvent: ActivityStreamEvent = JSON.parse(event.data);
          this.handleStreamEvent(streamEvent);
        } catch (error) {
          console.error('Failed to parse activity stream event:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('Activity tracking WebSocket disconnected');
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('Activity tracking WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize activity streaming:', error);
    }
  }

  /**
   * Handle incoming stream events
   */
  private handleStreamEvent(event: ActivityStreamEvent): void {
    this.streamHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Error executing activity stream handler:', error);
      }
    });
  }

  /**
   * Attempt to reconnect WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting activity WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initializeStreaming();
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    }
  }

  // =============================================================================
  // ACTIVITY LOGGING
  // =============================================================================

  /**
   * Log single activity
   * Maps to: POST /api/racine/activity/log
   */
  async logActivity(request: CreateActivityRequest): Promise<ActivityResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/activity/log`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to log activity: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Log batch of activities
   * Maps to: POST /api/racine/activity/batch-log
   */
  async logActivitiesBatch(activities: CreateActivityRequest[]): Promise<ActivityResponse[]> {
    const response = await fetch(`${this.config.baseURL}/api/racine/activity/batch-log`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ activities })
    });

    if (!response.ok) {
      throw new Error(`Failed to log activities batch: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Buffer activity for batch logging
   */
  bufferActivity(activity: ActivityRecord): void {
    this.activityBuffer.push(activity);
    
    if (this.activityBuffer.length >= this.config.batchSize) {
      this.flushActivityBuffer();
    }
  }

  /**
   * Flush activity buffer
   */
  private async flushActivityBuffer(): Promise<void> {
    if (this.activityBuffer.length === 0) return;

    try {
      const activities = this.activityBuffer.map(activity => ({
        activity_type: activity.activityType,
        category: activity.category,
        severity: activity.severity,
        description: activity.description,
        user_id: activity.userId,
        resource_type: activity.resourceType,
        resource_id: activity.resourceId,
        group_id: activity.groupId,
        metadata: activity.metadata
      }));

      await this.logActivitiesBatch(activities);
      this.activityBuffer = [];
    } catch (error) {
      console.error('Failed to flush activity buffer:', error);
    }
  }

  // =============================================================================
  // ACTIVITY RETRIEVAL
  // =============================================================================

  /**
   * Get activities with filtering and pagination
   * Maps to: GET /api/racine/activity/list
   */
  async getActivities(
    pagination?: PaginationRequest,
    filters?: FilterRequest,
    sort?: SortRequest
  ): Promise<ActivityListResponse> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }
    
    if (filters) {
      params.append('filters', JSON.stringify(filters));
    }
    
    if (sort) {
      params.append('sort', JSON.stringify(sort));
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/activity/list?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get activities: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get activity by ID
   * Maps to: GET /api/racine/activity/{id}
   */
  async getActivity(activityId: UUID): Promise<ActivityResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/activity/${activityId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get activity: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user activities
   * Maps to: GET /api/racine/activity/user/{userId}
   */
  async getUserActivities(
    userId: UUID,
    pagination?: PaginationRequest,
    filters?: FilterRequest
  ): Promise<ActivityListResponse> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }
    
    if (filters) {
      params.append('filters', JSON.stringify(filters));
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/activity/user/${userId}?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get user activities: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get group activities
   * Maps to: GET /api/racine/activity/group/{groupId}
   */
  async getGroupActivities(
    groupId: string,
    pagination?: PaginationRequest,
    filters?: FilterRequest
  ): Promise<ActivityListResponse> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }
    
    if (filters) {
      params.append('filters', JSON.stringify(filters));
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/activity/group/${groupId}?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get group activities: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // ACTIVITY SEARCH
  // =============================================================================

  /**
   * Search activities
   * Maps to: POST /api/racine/activity/search
   */
  async searchActivities(request: ActivitySearchRequest): Promise<ActivitySearchResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/activity/search`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to search activities: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search activities by correlation
   * Maps to: POST /api/racine/activity/search-correlation
   */
  async searchByCorrelation(
    correlationId: string,
    timeWindow?: { start: ISODateString; end: ISODateString }
  ): Promise<ActivityCorrelation[]> {
    const response = await fetch(`${this.config.baseURL}/api/racine/activity/search-correlation`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        correlation_id: correlationId,
        time_window: timeWindow
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to search by correlation: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // ANALYTICS AND REPORTING
  // =============================================================================

  /**
   * Get activity analytics
   * Maps to: POST /api/racine/activity/analytics
   */
  async getActivityAnalytics(request: ActivityAnalyticsRequest): Promise<ActivityAnalyticsResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/activity/analytics`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to get activity analytics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get activity timeline
   * Maps to: GET /api/racine/activity/timeline
   */
  async getActivityTimeline(
    timeRange: { start: ISODateString; end: ISODateString },
    granularity: 'minute' | 'hour' | 'day' | 'week' = 'hour',
    filters?: FilterRequest
  ): Promise<any> {
    const params = new URLSearchParams();
    params.append('start_date', timeRange.start);
    params.append('end_date', timeRange.end);
    params.append('granularity', granularity);
    
    if (filters) {
      params.append('filters', JSON.stringify(filters));
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/activity/timeline?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get activity timeline: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get activity heatmap
   * Maps to: GET /api/racine/activity/heatmap
   */
  async getActivityHeatmap(
    timeRange: { start: ISODateString; end: ISODateString },
    dimensions: string[] = ['user', 'group', 'activity_type']
  ): Promise<any> {
    const params = new URLSearchParams();
    params.append('start_date', timeRange.start);
    params.append('end_date', timeRange.end);
    params.append('dimensions', JSON.stringify(dimensions));

    const response = await fetch(`${this.config.baseURL}/api/racine/activity/heatmap?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get activity heatmap: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // AUDIT TRAILS
  // =============================================================================

  /**
   * Get audit trail
   * Maps to: POST /api/racine/activity/audit-trail
   */
  async getAuditTrail(request: AuditTrailRequest): Promise<AuditTrailResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/activity/audit-trail`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to get audit trail: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Export audit trail
   * Maps to: POST /api/racine/activity/export-audit-trail
   */
  async exportAuditTrail(
    request: AuditTrailRequest,
    format: 'csv' | 'xlsx' | 'pdf' = 'csv'
  ): Promise<Blob> {
    const response = await fetch(`${this.config.baseURL}/api/racine/activity/export-audit-trail`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        ...request,
        export_format: format
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to export audit trail: ${response.statusText}`);
    }

    return response.blob();
  }

  // =============================================================================
  // ANOMALY DETECTION
  // =============================================================================

  /**
   * Get activity anomalies
   * Maps to: GET /api/racine/activity/anomalies
   */
  async getActivityAnomalies(
    timeRange?: { start: ISODateString; end: ISODateString },
    severity?: ActivitySeverity[]
  ): Promise<ActivityAnomaly[]> {
    const params = new URLSearchParams();
    
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }
    
    if (severity) {
      params.append('severity', JSON.stringify(severity));
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/activity/anomalies?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get activity anomalies: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Report activity anomaly
   * Maps to: POST /api/racine/activity/report-anomaly
   */
  async reportAnomaly(
    activityId: UUID,
    description: string,
    severity: ActivitySeverity = ActivitySeverity.MEDIUM
  ): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/activity/report-anomaly`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        activity_id: activityId,
        description,
        severity
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to report anomaly: ${response.statusText}`);
    }
  }

  // =============================================================================
  // STREAMING MANAGEMENT
  // =============================================================================

  /**
   * Subscribe to activity stream
   */
  subscribeToStream(handler: ActivityStreamHandler): () => void {
    this.streamHandlers.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.streamHandlers.delete(handler);
    };
  }

  /**
   * Start real-time activity streaming
   */
  async startStreaming(): Promise<void> {
    if (!this.websocket) {
      await this.initializeStreaming();
    }
  }

  /**
   * Stop real-time activity streaming
   */
  stopStreaming(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  // =============================================================================
  // ACTIVITY CORRELATION ANALYSIS
  // =============================================================================

  /**
   * Analyze activity correlations
   * Maps to: POST /api/racine/activity/correlation
   */
  async analyzeActivityCorrelation(request: ActivityCorrelationRequest): Promise<APIResponse<ActivityCorrelationResponse>> {
    return this.makeRequest<ActivityCorrelationResponse>('/api/racine/activity/correlation', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });
  }

  /**
   * Get correlation analysis results
   * Maps to: GET /api/racine/activity/correlation/{correlation_id}
   */
  async getCorrelationResults(correlationId: UUID): Promise<APIResponse<ActivityCorrelationResponse>> {
    return this.makeRequest<ActivityCorrelationResponse>(`/api/racine/activity/correlation/${correlationId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
  }

  // =============================================================================
  // ACTIVITY SESSIONS MANAGEMENT
  // =============================================================================

  /**
   * Get activity sessions
   * Maps to: GET /api/racine/activity/sessions
   */
  async getActivitySessions(
    options: {
      limit?: number;
      offset?: number;
      start_date?: ISODateString;
      end_date?: ISODateString;
      active_only?: boolean;
    } = {}
  ): Promise<APIResponse<ActivitySessionResponse[]>> {
    const params = new URLSearchParams();
    
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.start_date) params.append('start_date', options.start_date);
    if (options.end_date) params.append('end_date', options.end_date);
    if (options.active_only) params.append('active_only', options.active_only.toString());

    const queryString = params.toString();
    const url = queryString ? `/api/racine/activity/sessions?${queryString}` : '/api/racine/activity/sessions';

    return this.makeRequest<ActivitySessionResponse[]>(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get specific activity session
   * Maps to: GET /api/racine/activity/sessions/{session_id}
   */
  async getActivitySession(sessionId: UUID): Promise<APIResponse<ActivitySessionResponse>> {
    return this.makeRequest<ActivitySessionResponse>(`/api/racine/activity/sessions/${sessionId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
  }

  // =============================================================================
  // ACTIVITY REPORTS GENERATION
  // =============================================================================

  /**
   * Generate activity report
   * Maps to: POST /api/racine/activity/reports
   */
  async generateActivityReport(request: ActivityReportRequest): Promise<APIResponse<ActivityReportResponse>> {
    return this.makeRequest<ActivityReportResponse>('/api/racine/activity/reports', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });
  }

  /**
   * Download activity report
   * Maps to: GET /api/racine/activity/reports/{report_id}/download
   */
  async downloadActivityReport(reportId: UUID): Promise<Blob> {
    const response = await fetch(`${this.config.baseURL}/api/racine/activity/reports/${reportId}/download`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to download activity report: ${response.statusText}`);
    }

    return response.blob();
  }

  // =============================================================================
  // ADVANCED SEARCH AND FILTERING
  // =============================================================================

  /**
   * Advanced activity search
   * Maps to: GET /api/racine/activity/search
   */
  async searchActivitiesAdvanced(request: AdvancedActivitySearchRequest): Promise<APIResponse<ActivityResponse[]>> {
    const params = new URLSearchParams();
    
    if (request.query) params.append('query', request.query);
    if (request.filters) {
      Object.entries(request.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(`filter.${key}`, String(value));
        }
      });
    }
    if (request.date_range) {
      params.append('start_date', request.date_range.start);
      params.append('end_date', request.date_range.end);
    }
    if (request.sort) {
      params.append('sort_by', request.sort.field);
      params.append('sort_order', request.sort.direction);
    }
    if (request.pagination) {
      params.append('page', request.pagination.page.toString());
      params.append('page_size', request.pagination.pageSize.toString());
    }

    return this.makeRequest<ActivityResponse[]>(`/api/racine/activity/search?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
  }

  // =============================================================================
  // SYSTEM HEALTH AND MONITORING
  // =============================================================================

  /**
   * Get activity system health
   * Maps to: GET /api/racine/activity/health
   */
  async getActivitySystemHealth(): Promise<APIResponse<ActivitySystemHealthResponse>> {
    return this.makeRequest<ActivitySystemHealthResponse>('/api/racine/activity/health', {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get activity system statistics
   * Maps to: GET /api/racine/activity/system-stats
   */
  async getActivitySystemStats(): Promise<APIResponse<ActivitySystemStatsResponse>> {
    return this.makeRequest<ActivitySystemStatsResponse>('/api/racine/activity/system-stats', {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
  }

  // =============================================================================
  // ANOMALY DETECTION (Enhanced)
  // =============================================================================

  // The original getActivityAnomalies and reportAnomaly methods are kept here
  // as they are not explicitly replaced by the new_code.
  // The new_code only added the new methods for correlation analysis, sessions, and reports.
  // The original methods for anomalies are still relevant and should be preserved.

  // =============================================================================
  // SESSION ANALYTICS
  // =============================================================================

  /**
   * Send session analytics data
   * Maps to: POST /api/racine/activity/session-analytics
   */
  async sendSessionAnalytics(sessionData: {
    sessionId: string;
    userId?: string;
    startTime: string;
    endTime: string;
    duration: number;
    activities: Array<{
      type: string;
      timestamp: string;
      data: any;
      metadata?: Record<string, any>;
    }>;
    navigationPath: string[];
    performanceMetrics?: {
      pageLoadTime: number;
      interactionDelay: number;
      memoryUsage?: number;
      cpuUsage?: number;
    };
    deviceInfo?: {
      userAgent: string;
      screenResolution: string;
      viewportSize: string;
      deviceType: string;
    };
    locationInfo?: {
      country?: string;
      region?: string;
      city?: string;
      timezone?: string;
    };
  }): Promise<void> {
    return withGracefulErrorHandling(
      async () => {
        const payload = {
          session_id: sessionData.sessionId,
          user_id: sessionData.userId,
          start_time: sessionData.startTime,
          end_time: sessionData.endTime,
          duration: sessionData.duration,
          activities: (sessionData.activities || []).map(activity => ({
            type: activity.type,
            timestamp: activity.timestamp,
            data: activity.data,
            metadata: activity.metadata
          })),
          navigation_path: sessionData.navigationPath,
          performance_metrics: sessionData.performanceMetrics,
          device_info: sessionData.deviceInfo,
          location_info: sessionData.locationInfo
        };

        const paths = [
          '/api/racine/activity/session-analytics',
          '/api/activity/session-analytics',
          '/activity/session-analytics',
          '/api/v1/racine/activity/session-analytics'
        ];

        let sent = false;
        for (const p of paths) {
          try {
            const r = await fetch(`${this.config.baseURL}${p}`, {
              method: 'POST',
              headers: this.getAuthHeaders(),
              body: JSON.stringify(payload)
            });
            if (r.ok) { sent = true; break; }
          } catch {}
        }

        if (!sent) {
          console.warn('Session analytics not sent (backend unavailable). Proceeding without blocking.');
          return;
        }

        console.log('Session analytics sent successfully');
      },
      {
        defaultValue: undefined,
        errorPrefix: 'Backend not available for sending session analytics'
      }
    );
  }

  /**
   * Get session analytics for a specific user or time period
   * Maps to: GET /api/racine/activity/session-analytics
   */
  async getSessionAnalytics(
    filters?: {
      userId?: string;
      startDate?: string;
      endDate?: string;
      sessionType?: string;
    },
    pagination?: PaginationRequest
  ): Promise<ActivitySessionResponse[]> {
    return withGracefulErrorHandling(
      async () => {
        const params = new URLSearchParams();
        
        if (filters?.userId) params.append('user_id', filters.userId);
        if (filters?.startDate) params.append('start_date', filters.startDate);
        if (filters?.endDate) params.append('end_date', filters.endDate);
        if (filters?.sessionType) params.append('session_type', filters.sessionType);
        
        if (pagination) {
          params.append('page', pagination.page.toString());
          params.append('limit', pagination.limit.toString());
        }

        const response = await fetch(`${this.config.baseURL}/api/racine/activity/session-analytics?${params}`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to get session analytics: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: [],
        errorPrefix: 'Backend not available for getting session analytics'
      }
    );
  }

  /**
   * Get session performance metrics
   * Maps to: GET /api/racine/activity/session-performance
   */
  async getSessionPerformanceMetrics(
    sessionId: string
  ): Promise<{
    sessionId: string;
    averagePageLoadTime: number;
    averageInteractionDelay: number;
    memoryUsageTrend: number[];
    cpuUsageTrend: number[];
    performanceScore: number;
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/activity/session-performance/${sessionId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get session performance metrics: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get session performance metrics:', error);
      throw error;
    }
  }

  /**
   * Track page view activity
   * Maps to: POST /api/racine/activity/track-page-view
   */
  async trackPageView(pageViewData: {
    url: string;
    title: string;
    referrer?: string;
    userId?: string;
    sessionId?: string;
    timestamp: string;
    loadTime?: number;
    viewportSize?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/activity/track-page-view`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          url: pageViewData.url,
          title: pageViewData.title,
          referrer: pageViewData.referrer,
          user_id: pageViewData.userId,
          session_id: pageViewData.sessionId,
          timestamp: pageViewData.timestamp,
          load_time: pageViewData.loadTime,
          viewport_size: pageViewData.viewportSize,
          user_agent: pageViewData.userAgent,
          metadata: pageViewData.metadata
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to track page view: ${response.statusText}`);
      }

      console.log('Page view tracked successfully');
    } catch (error) {
      console.error('Failed to track page view:', error);
      throw error;
    }
  }

  // =============================================================================
  // CLEANUP
  // =============================================================================

  /**
   * Cleanup all connections and flush buffers
   */
  cleanup(): void {
    // Flush any remaining activities
    if (this.activityBuffer.length > 0) {
      this.flushActivityBuffer();
    }
    
    // Close WebSocket connection
    this.stopStreaming();
    
    // Clear handlers
    this.streamHandlers.clear();
  }
}

// Create and export singleton instance
export const activityTrackingAPI = new ActivityTrackingAPI();

// Export class for direct instantiation if needed
export { ActivityTrackingAPI };

// Export types for external usage
export type {
  ActivityAPIConfig,
  ActivityStreamEvent,
  ActivityStreamHandler
};