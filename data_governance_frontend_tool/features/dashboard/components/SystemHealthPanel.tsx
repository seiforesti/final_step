'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Cpu,
  HardDrive,
  MemoryStick
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useWebSocket } from '@/components/providers/WebSocketProvider';
import { formatBytes, formatPercentage, cn } from '@/lib/utils';

interface SystemHealthData {
  overall_status: 'healthy' | 'warning' | 'critical';
  overall_score: number;
  components: {
    api_server: {
      status: 'healthy' | 'warning' | 'critical';
      response_time_ms: number;
      uptime_seconds: number;
      last_check: string;
    };
    database: {
      status: 'healthy' | 'warning' | 'critical';
      connection_count: number;
      query_time_ms: number;
      last_check: string;
    };
    websocket: {
      status: 'healthy' | 'warning' | 'critical';
      active_connections: number;
      last_check: string;
    };
    security: {
      status: 'healthy' | 'warning' | 'critical';
      active_sessions: number;
      failed_logins_last_hour: number;
      last_check: string;
    };
  };
  system_resources: {
    cpu_usage_percent: number;
    memory_usage_percent: number;
    disk_usage_percent: number;
    network_io_mbps: number;
  };
  alerts: Array<{
    id: string;
    severity: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
}

export function SystemHealthPanel() {
  const { isConnected } = useWebSocket();
  
  const { data: healthData, isLoading, error } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const response = await apiClient.get<SystemHealthData>('/api/v1/system/health');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="card p-6">
        <LoadingSpinner size="lg" text="Loading system health..." />
      </div>
    );
  }

  if (error || !healthData) {
    return (
      <div className="card p-6">
        <div className="flex items-center space-x-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>Failed to load system health data</span>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getResourceColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">System Health</h3>
            <p className="text-sm text-muted-foreground">Real-time system monitoring</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={cn(
              'px-3 py-1 rounded-full text-sm font-medium border',
              getStatusColor(healthData.overall_status)
            )}>
              {healthData.overall_status.charAt(0).toUpperCase() + healthData.overall_status.slice(1)}
            </div>
            <div className="text-2xl font-bold text-foreground">
              {healthData.overall_score}%
            </div>
          </div>
        </div>
      </div>

      <div className="card-content space-y-6">
        {/* Component Status */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Component Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Server className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Server</span>
                  {getStatusIcon(healthData.components.api_server.status)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {healthData.components.api_server.response_time_ms}ms • {formatUptime(healthData.components.api_server.uptime_seconds)} uptime
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Database className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database</span>
                  {getStatusIcon(healthData.components.database.status)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {healthData.components.database.connection_count} connections • {healthData.components.database.query_time_ms}ms
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Wifi className={cn(
                "h-5 w-5",
                isConnected ? "text-green-600" : "text-red-600"
              )} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">WebSocket</span>
                  {getStatusIcon(healthData.components.websocket.status)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {healthData.components.websocket.active_connections} active connections
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Security</span>
                  {getStatusIcon(healthData.components.security.status)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {healthData.components.security.active_sessions} sessions • {healthData.components.security.failed_logins_last_hour} failed logins
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Resources */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">System Resources</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">CPU</span>
                </div>
                <span className="text-sm font-medium">
                  {formatPercentage(healthData.system_resources.cpu_usage_percent)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={cn("h-2 rounded-full", getResourceColor(healthData.system_resources.cpu_usage_percent))}
                  style={{ width: `${healthData.system_resources.cpu_usage_percent}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MemoryStick className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Memory</span>
                </div>
                <span className="text-sm font-medium">
                  {formatPercentage(healthData.system_resources.memory_usage_percent)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={cn("h-2 rounded-full", getResourceColor(healthData.system_resources.memory_usage_percent))}
                  style={{ width: `${healthData.system_resources.memory_usage_percent}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Disk</span>
                </div>
                <span className="text-sm font-medium">
                  {formatPercentage(healthData.system_resources.disk_usage_percent)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={cn("h-2 rounded-full", getResourceColor(healthData.system_resources.disk_usage_percent))}
                  style={{ width: `${healthData.system_resources.disk_usage_percent}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Network</span>
                </div>
                <span className="text-sm font-medium">
                  {healthData.system_resources.network_io_mbps.toFixed(1)} Mbps
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${Math.min(healthData.system_resources.network_io_mbps * 10, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        {healthData.alerts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Recent Alerts</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {healthData.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg text-sm",
                    alert.severity === 'error' && 'bg-red-50 text-red-800 border border-red-200',
                    alert.severity === 'warning' && 'bg-yellow-50 text-yellow-800 border border-yellow-200',
                    alert.severity === 'info' && 'bg-blue-50 text-blue-800 border border-blue-200'
                  )}
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <Clock className="h-4 w-4" />
                    <span>{alert.message}</span>
                  </div>
                  <span className="text-xs opacity-75">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}