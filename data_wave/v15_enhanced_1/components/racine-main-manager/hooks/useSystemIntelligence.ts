/**
 * System Intelligence Hook - AI-Powered System Intelligence and Optimization
 * ==========================================================================
 *
 * This hook provides advanced system intelligence capabilities including anomaly detection,
 * predictive analytics, auto-optimization, and learning engine functionality.
 * Integrates with the backend intelligence services with graceful fallbacks.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { SystemIntelligence } from '../types/advanced-analytics.types';

interface UseSystemIntelligenceReturn {
  intelligence: SystemIntelligence | null;
  isLoading: boolean;
  error: string | null;
  enableAnomalyDetection: (sensitivity: "low" | "medium" | "high") => Promise<void>;
  triggerOptimization: (target: string, aggressiveness: "conservative" | "balanced" | "aggressive") => Promise<any>;
  refreshIntelligence: () => Promise<void>;
}

export const useSystemIntelligence = (): UseSystemIntelligenceReturn => {
  const [intelligence, setIntelligence] = useState<SystemIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);
  const isFetchingRef = useRef(false);

  const fetchIntelligence = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    const attemptFetch = async (): Promise<void> => {
      try {
        const response = await fetch('/api/racine/intelligence/data', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        if (!response.ok) {
          if (response.status === 502 && retryCount < maxRetries) {
            // Bad Gateway - retry after delay
            retryCount++;
            console.warn(`Intelligence data fetch attempt ${retryCount} failed with Bad Gateway, retrying...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
            return attemptFetch();
          }
          
          // For other errors or max retries reached, provide fallback data
          console.warn(`Intelligence data fetch failed: ${response.status} ${response.statusText}`);
          setIntelligence({
            insights: [],
            anomalies: [],
            recommendations: [],
            predictions: [],
            patterns: [],
            correlations: [],
            riskAssessment: null,
            optimizationOpportunities: [],
            systemHealthScore: 85,
            lastUpdated: new Date().toISOString()
          });
        } else {
          const data = await response.json();
          setIntelligence(data);
        }
      } catch (err) {
        if (retryCount < maxRetries) {
          // Network error - retry after delay
          retryCount++;
          console.warn(`Intelligence data fetch attempt ${retryCount} failed with network error, retrying...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
          return attemptFetch();
        }
        
        // Max retries reached, provide fallback data
        setError(`Network error after ${maxRetries} attempts. Using fallback data.`);
        console.error('Intelligence data fetch error after retries:', err);
        
        setIntelligence({
          insights: [],
          anomalies: [],
          recommendations: [],
          predictions: [],
          patterns: [],
          correlations: [],
          riskAssessment: null,
          optimizationOpportunities: [],
          systemHealthScore: 85,
          lastUpdated: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    await attemptFetch();
  }, []);

  const enableAnomalyDetection = useCallback(
    async (sensitivity: "low" | "medium" | "high") => {
      try {
        const response = await fetch('/api/racine/intelligence/anomaly-detection/enable', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ sensitivity }),
        });

        if (!response.ok) {
          throw new Error(`Failed to enable anomaly detection: ${response.statusText}`);
        }

        // Refresh intelligence data after enabling
        await fetchIntelligence();
      } catch (err) {
        console.error('Failed to enable anomaly detection:', err);
        throw err;
      }
    },
    [fetchIntelligence]
  );

  const triggerOptimization = useCallback(
    async (target: string, aggressiveness: "conservative" | "balanced" | "aggressive") => {
      try {
        const response = await fetch('/api/racine/intelligence/optimize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ target, aggressiveness }),
        });

        if (!response.ok) {
          throw new Error(`Failed to trigger optimization: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Refresh intelligence data after optimization
        await fetchIntelligence();
        
        return result;
      } catch (err) {
        console.error('Failed to trigger optimization:', err);
        throw err;
      }
    },
    [fetchIntelligence]
  );

  const refreshIntelligence = useCallback(async () => {
    await fetchIntelligence();
  }, [fetchIntelligence]);

  // Initial data fetch and periodic refresh
  useEffect(() => {
    // Stagger initial intelligence fetch slightly after analytics
    const mountTimer = setTimeout(fetchIntelligence, 250);
    const interval = setInterval(fetchIntelligence, 60000); // 1 minute
    
    return () => {
      clearTimeout(mountTimer);
      clearInterval(interval);
    };
  }, [fetchIntelligence]);

  return {
    intelligence,
    isLoading,
    error,
    enableAnomalyDetection,
    triggerOptimization,
    refreshIntelligence,
  };
};