"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wifi, WifiOff, Activity, Zap, AlertTriangle, CheckCircle2, Clock, Database, Users, Shield, TrendingUp, TrendingDown, Pause, Play, Settings, RefreshCw, Signal, Waves, Radio, Circle, Square, Triangle, Hexagon, MoreHorizontal, Eye, EyeOff, Volume2, VolumeX, Bell, BellOff, Maximize2, Minimize2, BarChart3, LineChart, PieChart, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

// Types and Interfaces
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | 'reconnecting';
export type DataFlowDirection = 'inbound' | 'outbound' | 'bidirectional';
export type IndicatorSize = 'sm' | 'md' | 'lg' | 'xl';
export type IndicatorVariant = 'default' | 'compact' | 'detailed' | 'minimal';
export type AlertLevel = 'info' | 'warning' | 'error' | 'success';

export interface ConnectionMetrics {
  latency: number;
  throughput: number;
  packetsPerSecond: number;
  errorRate: number;
  uptime: number;
  lastUpdate: string;
  bandwidth: {
    upload: number;
    download: number;
    total: number;
  };
  quality: {
    signal: number;
    stability: number;
    reliability: number;
  };
}

export interface DataFlowMetrics {
  direction: DataFlowDirection;
  bytesTransferred: number;
  messagesCount: number;
  averageMessageSize: number;
  compressionRatio: number;
  queueSize: number;
  processingTime: number;
  successRate: number;
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  temperature?: number;
  powerUsage?: number;
}

export interface RealTimeAlert {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  persistent: boolean;
  actions?: Array<{
    id: string;
    label: string;
    handler: () => void;
  }>;
}

export interface RealTimeIndicatorProps {
  status: ConnectionStatus;
  metrics?: ConnectionMetrics;
  dataFlow?: DataFlowMetrics;
  systemHealth?: SystemHealth;
  alerts?: RealTimeAlert[];
  size?: IndicatorSize;
  variant?: IndicatorVariant;
  showMetrics?: boolean;
  showDataFlow?: boolean;
  showSystemHealth?: boolean;
  showAlerts?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableSound?: boolean;
  enableNotifications?: boolean;
  onStatusChange?: (status: ConnectionStatus) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onRefresh?: () => void;
  onAlertAction?: (alert: RealTimeAlert, action: string) => void;
  onSettingsChange?: (settings: Record<string, any>) => void;
  className?: string;
}

// Animation variants
const pulseVariants = {
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const flowVariants = {
  flow: {
    x: [0, 100, 0],
    opacity: [0, 1, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const waveVariants = {
  wave: {
    pathLength: [0, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Status configurations
const statusConfig = {
  connected: {
    color: 'bg-green-500',
    textColor: 'text-green-600',
    icon: CheckCircle2,
    label: 'Connected',
    description: 'Real-time connection active'
  },
  connecting: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    icon: RefreshCw,
    label: 'Connecting',
    description: 'Establishing connection...'
  },
  disconnected: {
    color: 'bg-gray-500',
    textColor: 'text-gray-600',
    icon: WifiOff,
    label: 'Disconnected',
    description: 'No connection available'
  },
  error: {
    color: 'bg-red-500',
    textColor: 'text-red-600',
    icon: AlertTriangle,
    label: 'Error',
    description: 'Connection error occurred'
  },
  reconnecting: {
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    icon: RefreshCw,
    label: 'Reconnecting',
    description: 'Attempting to reconnect...'
  }
};

export const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({
  status,
  metrics,
  dataFlow,
  systemHealth,
  alerts = [],
  size = 'md',
  variant = 'default',
  showMetrics = true,
  showDataFlow = true,
  showSystemHealth = true,
  showAlerts = true,
  autoRefresh = true,
  refreshInterval = 5000,
  enableSound = false,
  enableNotifications = true,
  onStatusChange,
  onConnect,
  onDisconnect,
  onRefresh,
  onAlertAction,
  onSettingsChange,
  className
}) => {
  // Advanced Enterprise State Management
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState({
    autoRefresh,
    refreshInterval,
    enableSound,
    enableNotifications,
    showMetrics,
    showDataFlow,
    showSystemHealth,
    showAlerts
  });
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());
  
  // Advanced enterprise features
  const [intelligentAnalytics, setIntelligentAnalytics] = useState({
    anomalyDetection: {
      enabled: true,
      sensitivity: 0.8,
      detectedAnomalies: [] as Array<{
        timestamp: string;
        type: 'latency' | 'throughput' | 'error_rate' | 'connection_drops';
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        suggestedAction: string;
        autoResolved: boolean;
      }>
    },
    predictiveAnalytics: {
      enabled: true,
      forecastHorizon: 300000, // 5 minutes
      confidenceLevel: 0.95,
      predictions: {
        connectionStability: 0,
        expectedLatency: 0,
        throughputForecast: 0,
        riskFactors: [] as string[],
        nextMaintenanceWindow: null as string | null,
        resourceScalingNeeds: 'none' as 'none' | 'scale_up' | 'scale_down'
      }
    },
    businessImpactTracking: {
      enabled: true,
      metrics: {
        revenueImpact: 0,
        userExperienceScore: 0,
        slaCompliance: 0,
        operationalEfficiency: 0,
        costOptimizationScore: 0
      },
      thresholds: {
        revenueImpactCritical: 1000,
        userExperienceMinimum: 4.0,
        slaComplianceMinimum: 99.9
      }
    }
  });
  
  const [performanceHistory, setPerformanceHistory] = useState<Array<{
    timestamp: string;
    metrics: Partial<ConnectionMetrics>;
    predictions?: {
      nextMinuteLatency: number;
      throughputTrend: 'up' | 'down' | 'stable';
      riskAssessment: 'low' | 'medium' | 'high';
      optimizationSuggestions: string[];
    };
    businessImpact?: {
      usersSatisfied: number;
      transactionsAffected: number;
      revenueImpact: number;
    };
  }>>([]);
  
  const [enterpriseIntegrations, setEnterpriseIntegrations] = useState({
    monitoring: {
      datadog: { enabled: false, apiKey: '', dashboardUrl: '' },
      newRelic: { enabled: false, apiKey: '', appId: '' },
      splunk: { enabled: false, endpoint: '', token: '' },
      prometheus: { enabled: false, endpoint: '', queries: [] }
    },
    alerting: {
      pagerDuty: { enabled: false, serviceKey: '', escalationPolicy: '' },
      slack: { enabled: false, webhookUrl: '', channel: '' },
      email: { enabled: true, recipients: [], smtpConfig: {} },
      teams: { enabled: false, webhookUrl: '', mentions: [] }
    },
    compliance: {
      auditLogging: true,
      dataRetention: 90, // days
      encryptionAtRest: true,
      encryptionInTransit: true,
      accessControl: 'rbac',
      complianceStandards: ['SOC2', 'ISO27001', 'GDPR']
    }
  });

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Computed Values
  const currentConfig = useMemo(() => statusConfig[status], [status]);
  
  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm': return 'w-6 h-6 text-xs';
      case 'md': return 'w-8 h-8 text-sm';
      case 'lg': return 'w-10 h-10 text-base';
      case 'xl': return 'w-12 h-12 text-lg';
      default: return 'w-8 h-8 text-sm';
    }
  }, [size]);

  const activeAlerts = useMemo(() => {
    return alerts.filter(alert => !acknowledgedAlerts.has(alert.id));
  }, [alerts, acknowledgedAlerts]);

  const criticalAlerts = useMemo(() => {
    return activeAlerts.filter(alert => alert.level === 'error').length;
  }, [activeAlerts]);

  // Effects
  useEffect(() => {
    if (localSettings.autoRefresh && localSettings.refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        onRefresh?.();
      }, localSettings.refreshInterval);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [localSettings.autoRefresh, localSettings.refreshInterval, onRefresh]);

  useEffect(() => {
    if (localSettings.enableSound && criticalAlerts > 0) {
      // Play alert sound
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Ignore audio play errors
        });
      }
    }
  }, [criticalAlerts, localSettings.enableSound]);

  useEffect(() => {
    if (localSettings.enableNotifications && criticalAlerts > 0) {
      toast.error(`${criticalAlerts} critical alert${criticalAlerts > 1 ? 's' : ''} detected`);
    }
  }, [criticalAlerts, localSettings.enableNotifications]);

  // Handlers
  const handleSettingsChange = useCallback((updates: Partial<typeof localSettings>) => {
    const newSettings = { ...localSettings, ...updates };
    setLocalSettings(newSettings);
    onSettingsChange?.(newSettings);
  }, [localSettings, onSettingsChange]);

  const handleAlertAcknowledge = useCallback((alertId: string) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
  }, []);

  const handleAlertAction = useCallback((alert: RealTimeAlert, actionId: string) => {
    const action = alert.actions?.find(a => a.id === actionId);
    if (action) {
      action.handler();
      onAlertAction?.(alert, actionId);
    }
  }, [onAlertAction]);

  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatLatency = useCallback((ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }, []);

  // Render Functions
  const renderStatusIndicator = () => {
    const IconComponent = currentConfig.icon;
    
    return (
      <div className="flex items-center gap-2">
        <motion.div
          variants={pulseVariants}
          animate={status === 'connected' ? 'pulse' : undefined}
          className={cn(
            "rounded-full flex items-center justify-center",
            currentConfig.color,
            sizeClasses
          )}
        >
          <IconComponent 
            className={cn(
              "text-white",
              size === 'sm' && "h-3 w-3",
              size === 'md' && "h-4 w-4",
              size === 'lg' && "h-5 w-5",
              size === 'xl' && "h-6 w-6"
            )}
          />
        </motion.div>
        
        {variant !== 'minimal' && (
          <div className="flex flex-col">
            <span className={cn("font-medium", currentConfig.textColor)}>
              {currentConfig.label}
            </span>
            {variant === 'detailed' && (
              <span className="text-xs text-muted-foreground">
                {currentConfig.description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDataFlow = () => {
    if (!showDataFlow || !dataFlow) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Data Flow
        </h4>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-muted-foreground">Messages</div>
            <div className="font-medium">{dataFlow.messagesCount.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Bytes</div>
            <div className="font-medium">{formatBytes(dataFlow.bytesTransferred)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Success Rate</div>
            <div className="font-medium">{(dataFlow.successRate * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">Queue Size</div>
            <div className="font-medium">{dataFlow.queueSize}</div>
          </div>
        </div>

        {/* Visual Data Flow Animation */}
        <div className="relative h-8 bg-muted/50 rounded overflow-hidden">
          <motion.div
            variants={flowVariants}
            animate="flow"
            className="absolute top-1/2 left-0 w-2 h-2 bg-primary rounded-full transform -translate-y-1/2"
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            {dataFlow.direction === 'inbound' && '← Inbound'}
            {dataFlow.direction === 'outbound' && 'Outbound →'}
            {dataFlow.direction === 'bidirectional' && '↔ Bidirectional'}
          </div>
        </div>
      </div>
    );
  };

  const renderConnectionMetrics = () => {
    if (!showMetrics || !metrics) return null;

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Signal className="h-4 w-4" />
          Connection Metrics
        </h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Latency</span>
            <span className="font-medium">{formatLatency(metrics.latency)}</span>
          </div>
          <Progress value={Math.min((1000 - metrics.latency) / 10, 100)} className="h-1" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Throughput</span>
            <span className="font-medium">{formatBytes(metrics.throughput)}/s</span>
          </div>
          <Progress value={Math.min(metrics.throughput / 1000000 * 100, 100)} className="h-1" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Signal Quality</span>
            <span className="font-medium">{(metrics.quality.signal * 100).toFixed(0)}%</span>
          </div>
          <Progress value={metrics.quality.signal * 100} className="h-1" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-muted-foreground">Error Rate</div>
            <div className="font-medium text-red-600">{(metrics.errorRate * 100).toFixed(2)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">Uptime</div>
            <div className="font-medium">{(metrics.uptime / 3600).toFixed(1)}h</div>
          </div>
        </div>
      </div>
    );
  };

  const renderSystemHealth = () => {
    if (!showSystemHealth || !systemHealth) return null;

    const getHealthColor = (value: number) => {
      if (value > 90) return 'text-red-600';
      if (value > 70) return 'text-yellow-600';
      return 'text-green-600';
    };

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          System Health
        </h4>
        
        <div className="space-y-2">
          {Object.entries(systemHealth).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground capitalize">{key}</span>
                <span className={cn("font-medium", getHealthColor(value))}>
                  {value.toFixed(1)}%
                </span>
              </div>
              <Progress value={value} className="h-1" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAlerts = () => {
    if (!showAlerts || activeAlerts.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Active Alerts ({activeAlerts.length})
        </h4>
        
        <ScrollArea className="max-h-32">
          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "p-2 rounded border text-xs",
                  alert.level === 'error' && "bg-red-50 border-red-200 text-red-800",
                  alert.level === 'warning' && "bg-yellow-50 border-yellow-200 text-yellow-800",
                  alert.level === 'info' && "bg-blue-50 border-blue-200 text-blue-800",
                  alert.level === 'success' && "bg-green-50 border-green-200 text-green-800"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-xs opacity-75">{alert.message}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleAlertAcknowledge(alert.id)}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                  </Button>
                </div>
                
                {alert.actions && alert.actions.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {alert.actions.map((action) => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        className="h-5 text-xs px-2"
                        onClick={() => handleAlertAction(alert, action.id)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderSettings = () => (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute top-full left-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg p-4 z-50"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Real-time Settings</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Auto Refresh</Label>
                <Switch
                  checked={localSettings.autoRefresh}
                  onCheckedChange={(checked) => handleSettingsChange({ autoRefresh: checked })}
                />
              </div>

              {localSettings.autoRefresh && (
                <div className="space-y-2">
                  <Label className="text-xs">Refresh Interval (ms)</Label>
                  <Slider
                    value={[localSettings.refreshInterval]}
                    onValueChange={([value]) => handleSettingsChange({ refreshInterval: value })}
                    min={1000}
                    max={30000}
                    step={1000}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    {localSettings.refreshInterval}ms
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Display Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Show Metrics</span>
                    <Switch
                      checked={localSettings.showMetrics}
                      onCheckedChange={(checked) => handleSettingsChange({ showMetrics: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Show Data Flow</span>
                    <Switch
                      checked={localSettings.showDataFlow}
                      onCheckedChange={(checked) => handleSettingsChange({ showDataFlow: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Show System Health</span>
                    <Switch
                      checked={localSettings.showSystemHealth}
                      onCheckedChange={(checked) => handleSettingsChange({ showSystemHealth: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Show Alerts</span>
                    <Switch
                      checked={localSettings.showAlerts}
                      onCheckedChange={(checked) => handleSettingsChange({ showAlerts: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Notifications</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Enable Sound</span>
                    <Switch
                      checked={localSettings.enableSound}
                      onCheckedChange={(checked) => handleSettingsChange({ enableSound: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Enable Notifications</span>
                    <Switch
                      checked={localSettings.enableNotifications}
                      onCheckedChange={(checked) => handleSettingsChange({ enableNotifications: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (variant === 'minimal') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("relative", className)}>
              {renderStatusIndicator()}
              {criticalAlerts > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">{criticalAlerts}</span>
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div>{currentConfig.label}</div>
              <div className="text-muted-foreground">{currentConfig.description}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("relative", className)}>
        <Card className="w-fit">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-3">
              {renderStatusIndicator()}
              
              {criticalAlerts > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {criticalAlerts} alerts
                </Badge>
              )}
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRefresh?.()}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="h-6 w-6 p-0"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {renderSettings()}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {renderStatusIndicator()}
              
              {criticalAlerts > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {criticalAlerts} critical
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRefresh?.()}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {status === 'disconnected' && (
                    <DropdownMenuItem onClick={() => onConnect?.()}>
                      <Wifi className="h-4 w-4 mr-2" />
                      Connect
                    </DropdownMenuItem>
                  )}
                  
                  {status === 'connected' && (
                    <DropdownMenuItem onClick={() => onDisconnect?.()}>
                      <WifiOff className="h-4 w-4 mr-2" />
                      Disconnect
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={() => setShowSettings(!showSettings)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0 space-y-4">
                {renderConnectionMetrics()}
                {renderDataFlow()}
                {renderSystemHealth()}
                {renderAlerts()}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      
      {renderSettings()}
      
      {/* Hidden audio element for alert sounds */}
      <audio
        ref={audioRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="/sounds/alert.mp3" type="audio/mpeg" />
        <source src="/sounds/alert.wav" type="audio/wav" />
      </audio>
    </div>
  );
};

export default RealTimeIndicator;