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
    setIsLoading(true);
    setError(null);

    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    const attemptFetch = async (): Promise<void> => {
      try {
        const response = await fetch('/api/racine/security/data', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        if (!response.ok) {
          if (response.status === 502 && retryCount < maxRetries) {
            // Bad Gateway - retry after delay
            retryCount++;
            console.warn(`Security data fetch attempt ${retryCount} failed with Bad Gateway, retrying...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
            return attemptFetch();
          }
          
          // For other errors or max retries reached, provide fallback data
          console.warn(`Security data fetch failed: ${response.status} ${response.statusText}`);
          setSecurityConfig({
            enabled: false,
            policies: [],
            rules: [],
            threatDetection: false
          });
          setAuditLogs([]);
          setSecurityAlerts([]);
          setComplianceStatus(null);
        } else {
          const [configData, auditData, alertsData, complianceData] = await Promise.all([
            response.json(),
            fetch('/api/racine/security/audit').then(r => r.ok ? r.json() : []),
            fetch('/api/racine/security/alerts').then(r => r.ok ? r.json() : []),
            fetch('/api/racine/security/compliance').then(r => r.ok ? r.json() : null)
          ]);
          
          setSecurityConfig(configData);
          setAuditLogs(auditData);
          setSecurityAlerts(alertsData);
          setComplianceStatus(complianceData);
        }
      } catch (err) {
        if (retryCount < maxRetries) {
          // Network error - retry after delay
          retryCount++;
          console.warn(`Security data fetch attempt ${retryCount} failed with network error, retrying...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
          return attemptFetch();
        }
        
        // Max retries reached, provide fallback data
        setError(`Network error after ${maxRetries} attempts. Using fallback data.`);
        console.error('Security data fetch error after retries:', err);
        
        setSecurityConfig({
          enabled: false,
          policies: [],
          rules: [],
          threatDetection: false
        });
        setAuditLogs([]);
        setSecurityAlerts([]);
        setComplianceStatus(null);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    await attemptFetch();
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