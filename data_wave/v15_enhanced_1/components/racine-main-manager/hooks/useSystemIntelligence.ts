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

  const fetchIntelligence = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/proxy/racine/intelligence/comprehensive', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 503) {
          // Backend not available, provide graceful fallback
          setIntelligence({
            anomalyDetection: {
              enabled: false,
              sensitivity: "medium",
              detectedAnomalies: [],
              predictions: [],
            },
            predictiveAnalytics: {
              enabled: false,
              forecastHorizon: 30,
              accuracy: 0,
              trends: [],
              recommendations: [],
            },
            autoOptimization: {
              enabled: false,
              aggressiveness: "balanced",
              lastOptimization: new Date().toISOString(),
              optimizationHistory: [],
            },
            learningEngine: {
              enabled: false,
              modelVersion: "1.0.0",
              trainingData: {
                samples: 0,
                lastUpdate: new Date().toISOString(),
                accuracy: 0,
              },
              adaptations: [],
            },
          });
        } else {
          throw new Error(`Failed to fetch intelligence data: ${response.statusText}`);
        }
      } else {
        const data = await response.json();
        setIntelligence(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch intelligence data';
      setError(errorMessage);
      console.error('System intelligence fetch error:', err);
      
      // Provide fallback data on error
      setIntelligence({
        anomalyDetection: {
          enabled: false,
          sensitivity: "medium",
          detectedAnomalies: [],
          predictions: [],
        },
        predictiveAnalytics: {
          enabled: false,
          forecastHorizon: 30,
          accuracy: 0,
          trends: [],
          recommendations: [],
        },
        autoOptimization: {
          enabled: false,
          aggressiveness: "balanced",
          lastOptimization: new Date().toISOString(),
          optimizationHistory: [],
        },
        learningEngine: {
          enabled: false,
          modelVersion: "1.0.0",
          trainingData: {
            samples: 0,
            lastUpdate: new Date().toISOString(),
            accuracy: 0,
          },
          adaptations: [],
        },
      });
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
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