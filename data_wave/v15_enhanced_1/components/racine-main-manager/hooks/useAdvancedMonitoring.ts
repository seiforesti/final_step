/**
 * Advanced Monitoring Hook - Enterprise System Monitoring and Alerting
 * ====================================================================
 *
 * This hook provides comprehensive monitoring capabilities including metrics tracking,
 * alert management, dashboard configuration, and real-time system health monitoring.
 * Integrates with backend monitoring services with proper error handling.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { MonitoringConfiguration, AlertRule } from '../types/advanced-analytics.types';

interface UseAdvancedMonitoringReturn {
  monitoringConfig: MonitoringConfiguration | null;
  activeAlerts: any[];
  alertHistory: any[];
  isLoading: boolean;
  error: string | null;
  createAlertRule: (rule: Omit<AlertRule, "id" | "lastTriggered" | "triggerCount">) => Promise<AlertRule>;
  testAlertChannel: (channelId: string) => Promise<boolean>;
  acknowledgeAlert: (alertId: string, note?: string) => Promise<void>;
  refreshMonitoring: () => Promise<void>;
}

export const useAdvancedMonitoring = (): UseAdvancedMonitoringReturn => {
  const [monitoringConfig, setMonitoringConfig] = useState<MonitoringConfiguration | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [alertHistory, setAlertHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchMonitoringData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch monitoring configuration
      const configResponse = await fetch('/api/racine/monitoring/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      // Fetch active alerts
      const alertsResponse = await fetch('/api/racine/monitoring/alerts/active', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      // Fetch alert history
      const historyResponse = await fetch('/api/racine/monitoring/alerts/history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!configResponse.ok || !alertsResponse.ok || !historyResponse.ok) {
        if (configResponse.status === 404 || configResponse.status === 503) {
          // Backend not available, provide graceful fallback
          setMonitoringConfig({
            metrics: {
              enabled: [],
              thresholds: {},
              aggregation: {},
              retention: {},
            },
            alerting: {
              channels: [],
              rules: [],
              escalation: [],
              suppressions: [],
            },
            dashboards: {
              realTime: [],
              historical: [],
              custom: [],
            },
          });
          setActiveAlerts([]);
          setAlertHistory([]);
        } else {
          throw new Error('Failed to fetch monitoring data');
        }
      } else {
        const [configData, alertsData, historyData] = await Promise.all([
          configResponse.json(),
          alertsResponse.json(),
          historyResponse.json(),
        ]);

        setMonitoringConfig(configData);
        setActiveAlerts(alertsData);
        setAlertHistory(historyData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch monitoring data';
      setError(errorMessage);
      console.error('Monitoring data fetch error:', err);
      
      // Provide fallback data on error
      setMonitoringConfig({
        metrics: {
          enabled: [],
          thresholds: {},
          aggregation: {},
          retention: {},
        },
        alerting: {
          channels: [],
          rules: [],
          escalation: [],
          suppressions: [],
        },
        dashboards: {
          realTime: [],
          historical: [],
          custom: [],
        },
      });
      setActiveAlerts([]);
      setAlertHistory([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const createAlertRule = useCallback(
    async (rule: Omit<AlertRule, "id" | "lastTriggered" | "triggerCount">) => {
      try {
        const response = await fetch('/api/racine/monitoring/alert-rules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify(rule),
        });

        if (!response.ok) {
          throw new Error(`Failed to create alert rule: ${response.statusText}`);
        }

        const newRule = await response.json();
        
        // Refresh monitoring data after rule creation
        await fetchMonitoringData();
        
        return newRule;
      } catch (err) {
        console.error('Failed to create alert rule:', err);
        throw err;
      }
    },
    [fetchMonitoringData]
  );

  const testAlertChannel = useCallback(async (channelId: string) => {
    try {
      const response = await fetch(`/api/racine/monitoring/alert-channels/${channelId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to test alert channel: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Failed to test alert channel:', err);
      return false;
    }
  }, []);

  const acknowledgeAlert = useCallback(
    async (alertId: string, note?: string) => {
      try {
        const response = await fetch(`/api/racine/monitoring/alerts/${alertId}/acknowledge`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ note }),
        });

        if (!response.ok) {
          throw new Error(`Failed to acknowledge alert: ${response.statusText}`);
        }

        setActiveAlerts(prev =>
          prev.map(alert =>
            alert.id === alertId
              ? {
                  ...alert,
                  acknowledged: true,
                  acknowledgedAt: new Date().toISOString(),
                }
              : alert
          )
        );
      } catch (err) {
        console.error('Failed to acknowledge alert:', err);
        throw err;
      }
    },
    []
  );

  const refreshMonitoring = useCallback(async () => {
    await fetchMonitoringData();
  }, [fetchMonitoringData]);

  // Initial data fetch and periodic refresh
  useEffect(() => {
    const mountTimer = setTimeout(fetchMonitoringData, 1000);
    const interval = setInterval(fetchMonitoringData, 30000); // 30 seconds
    
    return () => {
      clearTimeout(mountTimer);
      clearInterval(interval);
    };
  }, [fetchMonitoringData]);

  return {
    monitoringConfig,
    activeAlerts,
    alertHistory,
    isLoading,
    error,
    createAlertRule,
    testAlertChannel,
    acknowledgeAlert,
    refreshMonitoring,
  };
};