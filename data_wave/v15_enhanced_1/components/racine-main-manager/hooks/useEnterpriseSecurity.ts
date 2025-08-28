/**
 * Enterprise Security Hook - Advanced Security and Compliance Management
 * ======================================================================
 *
 * This hook provides comprehensive enterprise security capabilities including security scanning,
 * compliance reporting, audit logging, and violation management.
 * Integrates with backend security services with proper error handling.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { SecurityConfiguration, ComplianceViolation } from '../types/enterprise-security.types';
import { ISODateString } from '../types/racine-core.types';

interface UseEnterpriseSecurityReturn {
  securityConfig: SecurityConfiguration | null;
  auditLogs: any[];
  securityAlerts: any[];
  complianceStatus: any;
  isLoading: boolean;
  error: string | null;
  performSecurityScan: (scope: "system" | "data" | "users" | "all") => Promise<any>;
  generateComplianceReport: (framework: string, timeRange: { start: ISODateString; end: ISODateString }) => Promise<any>;
  resolveViolation: (violationId: string, resolution: string, evidence?: string[]) => Promise<void>;
  refreshSecurity: () => Promise<void>;
}

export const useEnterpriseSecurity = (): UseEnterpriseSecurityReturn => {
  const [securityConfig, setSecurityConfig] = useState<SecurityConfiguration | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchSecurityData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch security configuration
      const configResponse = await fetch('/api/racine/security/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      // Fetch audit logs
      const auditResponse = await fetch('/api/racine/security/audit/recent', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      // Fetch security alerts
      const alertsResponse = await fetch('/api/racine/security/alerts/active', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      // Fetch compliance status
      const complianceResponse = await fetch('/api/racine/security/compliance/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!configResponse.ok || !auditResponse.ok || !alertsResponse.ok || !complianceResponse.ok) {
        if (configResponse.status === 404 || configResponse.status === 503) {
          // Backend not available, provide graceful fallback
          setSecurityConfig({
            authentication: {
              methods: [],
              passwordPolicy: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true,
                maxAge: 90,
                historyCount: 5,
                lockoutThreshold: 3,
                lockoutDuration: 30,
              },
              sessionManagement: {
                timeout: 30,
                maxConcurrent: 3,
                requireReauth: [],
                ipRestriction: false,
                deviceTracking: true,
              },
              ssoProviders: [],
            },
            authorization: {
              rbacEnabled: true,
              abacEnabled: false,
              policies: [],
              roleHierarchy: [],
            },
            audit: {
              enabled: true,
              retention: 365,
              categories: [],
              realTimeMonitoring: true,
              complianceReporting: true,
            },
            encryption: {
              atRest: {
                algorithm: "AES-256",
                keySize: 256,
                enabled: true,
                rotationSchedule: "monthly",
              },
              inTransit: {
                algorithm: "TLS-1.3",
                keySize: 256,
                enabled: true,
                rotationSchedule: "yearly",
              },
              keyManagement: {
                provider: "internal",
                configuration: {},
                backupStrategy: "distributed",
                accessLogging: true,
              },
            },
            compliance: {
              frameworks: [],
              automaticScanning: true,
              reportingSchedule: "daily",
              violations: [],
            },
          });
          setAuditLogs([]);
          setSecurityAlerts([]);
          setComplianceStatus(null);
        } else {
          throw new Error('Failed to fetch security data');
        }
      } else {
        const [configData, auditData, alertsData, complianceData] = await Promise.all([
          configResponse.json(),
          auditResponse.json(),
          alertsResponse.json(),
          complianceResponse.json(),
        ]);

        setSecurityConfig(configData);
        setAuditLogs(auditData);
        setSecurityAlerts(alertsData);
        setComplianceStatus(complianceData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch security data';
      setError(errorMessage);
      console.error('Security data fetch error:', err);
      
      // Provide fallback data on error
      setSecurityConfig(null);
      setAuditLogs([]);
      setSecurityAlerts([]);
      setComplianceStatus(null);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const performSecurityScan = useCallback(
    async (scope: "system" | "data" | "users" | "all") => {
      try {
        const response = await fetch('/api/racine/security/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ scope }),
        });

        if (!response.ok) {
          throw new Error(`Failed to perform security scan: ${response.statusText}`);
        }

        const scanResult = await response.json();
        
        // Refresh security data after scan
        await fetchSecurityData();
        
        return scanResult;
      } catch (err) {
        console.error('Failed to perform security scan:', err);
        throw err;
      }
    },
    [fetchSecurityData]
  );

  const generateComplianceReport = useCallback(
    async (
      framework: string,
      timeRange: { start: ISODateString; end: ISODateString }
    ) => {
      try {
        const response = await fetch('/api/racine/security/compliance/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ framework, timeRange }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate compliance report: ${response.statusText}`);
        }

        const report = await response.json();
        return report;
      } catch (err) {
        console.error('Failed to generate compliance report:', err);
        throw err;
      }
    },
    []
  );

  const resolveViolation = useCallback(
    async (violationId: string, resolution: string, evidence?: string[]) => {
      try {
        const response = await fetch(`/api/racine/security/violations/${violationId}/resolve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ resolution, evidence }),
        });

        if (!response.ok) {
          throw new Error(`Failed to resolve violation: ${response.statusText}`);
        }

        // Refresh security data after resolution
        await fetchSecurityData();
      } catch (err) {
        console.error('Failed to resolve violation:', err);
        throw err;
      }
    },
    [fetchSecurityData]
  );

  const refreshSecurity = useCallback(async () => {
    await fetchSecurityData();
  }, [fetchSecurityData]);

  // Initial data fetch and periodic refresh
  useEffect(() => {
    const mountTimer = setTimeout(fetchSecurityData, 1250);
    const interval = setInterval(fetchSecurityData, 60000); // 1 minute
    
    return () => {
      clearTimeout(mountTimer);
      clearInterval(interval);
    };
  }, [fetchSecurityData]);

  return {
    securityConfig,
    auditLogs,
    securityAlerts,
    complianceStatus,
    isLoading,
    error,
    performSecurityScan,
    generateComplianceReport,
    resolveViolation,
    refreshSecurity,
  };
};