/**
 * Global WebSocket Hook for Data Sources SPA
 * Replaces all polling with real-time WebSocket updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// WebSocket connection states
export type WebSocketState = 'connecting' | 'connected' | 'disconnected' | 'error';

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

// Global WebSocket manager
class GlobalWebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectInterval: number | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private pingInterval: number | null = null;
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private stateChangeHandlers: Set<(state: WebSocketState) => void> = new Set();
  private isConnecting = false;
  private shouldReconnect = true;

  constructor() {
    this.connect();
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host.split(':')[0];
    const port = process.env.NEXT_PUBLIC_WS_PORT || '8000';
    return `${protocol}//${host}:${port}/ws/data-sources/global`;
  }

  public connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    this.notifyStateChange('connecting');

    try {
      this.ws = new WebSocket(this.getWebSocketUrl());

      this.ws.onopen = () => {
        console.log('🌐 Global WebSocket connected');
        this.isConnecting = false;
        this.reconnectDelay = 1000; // Reset reconnect delay
        this.notifyStateChange('connected');
        this.startPing();
        this.clearReconnectInterval();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.warn('🔌 Global WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.notifyStateChange('disconnected');
        this.stopPing();
        
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ Global WebSocket error:', error);
        this.isConnecting = false;
        this.notifyStateChange('error');
        this.ws?.close();
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.notifyStateChange('error');
    }
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnectInterval();
    this.stopPing();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.notifyStateChange('disconnected');
  }

  public send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
    }
  }

  public subscribe(messageType: string, handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    
    this.messageHandlers.get(messageType)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(messageType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(messageType);
        }
      }
    };
  }

  public onStateChange(handler: (state: WebSocketState) => void): () => void {
    this.stateChangeHandlers.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.stateChangeHandlers.delete(handler);
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data);
        } catch (error) {
          console.error(`❌ Error in message handler for ${message.type}:`, error);
        }
      });
    }
  }

  private notifyStateChange(state: WebSocketState): void {
    this.stateChangeHandlers.forEach(handler => {
      try {
        handler(state);
      } catch (error) {
        console.error('❌ Error in state change handler:', error);
      }
    });
  }

  private startPing(): void {
    this.pingInterval = window.setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000); // Ping every 30 seconds
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectInterval) {
      return;
    }

    this.reconnectInterval = window.setInterval(() => {
      console.log('🔄 Attempting to reconnect Global WebSocket...');
      this.connect();
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
    }, this.reconnectDelay);
  }

  private clearReconnectInterval(): void {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  public getState(): WebSocketState {
    if (this.isConnecting) return 'connecting';
    if (this.ws?.readyState === WebSocket.OPEN) return 'connected';
    if (this.ws?.readyState === WebSocket.CLOSED) return 'disconnected';
    return 'error';
  }
}

// Global instance
const globalWebSocketManager = new GlobalWebSocketManager();

// Hook for using the global WebSocket
export const useGlobalWebSocket = () => {
  const [state, setState] = useState<WebSocketState>('disconnected');
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = globalWebSocketManager.onStateChange(setState);
    return unsubscribe;
  }, []);

  const send = useCallback((message: any) => {
    globalWebSocketManager.send(message);
  }, []);

  const subscribe = useCallback((messageType: string, handler: (data: any) => void) => {
    return globalWebSocketManager.subscribe(messageType, handler);
  }, []);

  const requestData = useCallback((dataType: string, params: any = {}) => {
    globalWebSocketManager.send({
      type: `request_${dataType}`,
      data: params
    });
  }, []);

  return {
    state,
    send,
    subscribe,
    requestData,
    isConnected: state === 'connected',
    isConnecting: state === 'connecting',
    isDisconnected: state === 'disconnected',
    hasError: state === 'error'
  };
};

// Hook for specific data types
export const useWebSocketData = <T = any>(dataType: string, params: any = {}) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { requestData, subscribe, isConnected } = useGlobalWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    setIsLoading(true);
    setError(null);
    requestData(dataType, params);

    const unsubscribe = subscribe(`${dataType}_updated`, (newData: T) => {
      setData(newData);
      setIsLoading(false);
    });

    const errorUnsubscribe = subscribe('error', (errorData: any) => {
      if (errorData.message?.includes(dataType)) {
        setError(errorData.message);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
      errorUnsubscribe();
    };
  }, [isConnected, dataType, params, requestData, subscribe]);

  return { data, isLoading, error };
};

// Hook for data sources
export const useWebSocketDataSources = () => {
  return useWebSocketData('data_sources');
};

// Hook for user data
export const useWebSocketUserData = () => {
  return useWebSocketData('user_data');
};

// Hook for notifications
export const useWebSocketNotifications = () => {
  return useWebSocketData('notifications');
};

// Hook for workspace data
export const useWebSocketWorkspaceData = () => {
  return useWebSocketData('workspace_data');
};

// Hook for data source metrics
export const useWebSocketDataSourceMetrics = (dataSourceId: number) => {
  return useWebSocketData('data_source_metrics', { dataSourceId });
};

// Hook for data source health
export const useWebSocketDataSourceHealth = (dataSourceId: number) => {
  return useWebSocketData('data_source_health', { dataSourceId });
};

// Hook for discovery history
export const useWebSocketDiscoveryHistory = (dataSourceId: number) => {
  return useWebSocketData('discovery_history', { dataSourceId });
};

// Hook for scan results
export const useWebSocketScanResults = (dataSourceId: number) => {
  return useWebSocketData('scan_results', { dataSourceId });
};

// Hook for quality metrics
export const useWebSocketQualityMetrics = (dataSourceId: number) => {
  return useWebSocketData('quality_metrics', { dataSourceId });
};

// Hook for growth metrics
export const useWebSocketGrowthMetrics = (dataSourceId: number) => {
  return useWebSocketData('growth_metrics', { dataSourceId });
};

// Hook for schema discovery
export const useWebSocketSchemaDiscovery = (dataSourceId: number) => {
  return useWebSocketData('schema_discovery', { dataSourceId });
};

// Hook for data lineage
export const useWebSocketDataLineage = (dataSourceId: number) => {
  return useWebSocketData('data_lineage', { dataSourceId });
};

// Hook for backup status
export const useWebSocketBackupStatus = (dataSourceId: number) => {
  return useWebSocketData('backup_status', { dataSourceId });
};

// Hook for scheduled tasks
export const useWebSocketScheduledTasks = (dataSourceId: number) => {
  return useWebSocketData('scheduled_tasks', { dataSourceId });
};

// Hook for audit logs
export const useWebSocketAuditLogs = (dataSourceId: number) => {
  return useWebSocketData('audit_logs', { dataSourceId });
};

// Hook for user permissions
export const useWebSocketUserPermissions = () => {
  return useWebSocketData('user_permissions');
};

// Hook for data catalog
export const useWebSocketDataCatalog = () => {
  return useWebSocketData('data_catalog');
};

// Hook for collaboration workspaces
export const useWebSocketCollaborationWorkspaces = () => {
  return useWebSocketData('collaboration_workspaces');
};

// Hook for active collaboration sessions
export const useWebSocketActiveCollaborationSessions = () => {
  return useWebSocketData('active_collaboration_sessions');
};

// Hook for shared documents
export const useWebSocketSharedDocuments = (dataSourceId: number, documentType: string = 'all') => {
  return useWebSocketData('shared_documents', { dataSourceId, documentType });
};

// Hook for document comments
export const useWebSocketDocumentComments = (documentId: string) => {
  return useWebSocketData('document_comments', { documentId });
};

// Hook for workspace activity
export const useWebSocketWorkspaceActivity = (workspaceId: string, days: number = 7) => {
  return useWebSocketData('workspace_activity', { workspaceId, days });
};

// Hook for workflow definitions
export const useWebSocketWorkflowDefinitions = () => {
  return useWebSocketData('workflow_definitions');
};

// Hook for workflow executions
export const useWebSocketWorkflowExecutions = (days: number = 7) => {
  return useWebSocketData('workflow_executions', { days });
};

// Hook for pending approvals
export const useWebSocketPendingApprovals = () => {
  return useWebSocketData('pending_approvals');
};

// Hook for workflow templates
export const useWebSocketWorkflowTemplates = () => {
  return useWebSocketData('workflow_templates');
};

// Hook for bulk operation status
export const useWebSocketBulkOperationStatus = () => {
  return useWebSocketData('bulk_operation_status');
};

// Hook for system health
export const useWebSocketSystemHealth = () => {
  return useWebSocketData('system_health');
};

// Hook for enhanced performance metrics
export const useWebSocketEnhancedPerformanceMetrics = (
  dataSourceId: number,
  timeRange: string = '24h',
  metricTypes: string[] = ['cpu', 'memory', 'io', 'network']
) => {
  return useWebSocketData('enhanced_performance_metrics', {
    dataSourceId,
    timeRange,
    metricTypes
  });
};

// Hook for performance alerts
export const useWebSocketPerformanceAlerts = (severity: string = 'all', days: number = 7) => {
  return useWebSocketData('performance_alerts', { severity, days });
};

// Hook for performance trends
export const useWebSocketPerformanceTrends = (dataSourceId: number, period: string = '30d') => {
  return useWebSocketData('performance_trends', { dataSourceId, period });
};

// Hook for optimization recommendations
export const useWebSocketOptimizationRecommendations = (dataSourceId: number) => {
  return useWebSocketData('optimization_recommendations', { dataSourceId });
};

// Hook for performance summary report
export const useWebSocketPerformanceSummaryReport = (timeRange: string = '7d') => {
  return useWebSocketData('performance_summary_report', { timeRange });
};

// Hook for performance thresholds
export const useWebSocketPerformanceThresholds = (dataSourceId: number) => {
  return useWebSocketData('performance_thresholds', { dataSourceId });
};

// Hook for enhanced security audit
export const useWebSocketEnhancedSecurityAudit = (
  dataSourceId: number,
  includeVulnerabilities: boolean = true,
  includeCompliance: boolean = true
) => {
  return useWebSocketData('enhanced_security_audit', {
    dataSourceId,
    includeVulnerabilities,
    includeCompliance
  });
};

// Hook for vulnerability assessments
export const useWebSocketVulnerabilityAssessments = (severity: string = 'all') => {
  return useWebSocketData('vulnerability_assessments', { severity });
};

// Hook for security incidents
export const useWebSocketSecurityIncidents = (days: number = 30) => {
  return useWebSocketData('security_incidents', { days });
};

// Hook for compliance checks
export const useWebSocketComplianceChecks = () => {
  return useWebSocketData('compliance_checks');
};

// Hook for threat detection
export const useWebSocketThreatDetection = (days: number = 7) => {
  return useWebSocketData('threat_detection', { days });
};

// Hook for security analytics dashboard
export const useWebSocketSecurityAnalyticsDashboard = (period: string = '7d') => {
  return useWebSocketData('security_analytics_dashboard', { period });
};

// Hook for risk assessment report
export const useWebSocketRiskAssessmentReport = () => {
  return useWebSocketData('risk_assessment_report');
};

// Hook for security scans
export const useWebSocketSecurityScans = (days: number = 30) => {
  return useWebSocketData('security_scans', { days });
};

export default globalWebSocketManager;

