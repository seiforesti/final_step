/**
 * Cost Optimization Hook - Enterprise Cost Management and Budget Control
 * ======================================================================
 *
 * This hook provides comprehensive cost optimization capabilities including budget management,
 * spending analysis, optimization opportunities, and financial forecasting.
 * Integrates with backend cost management services with proper error handling.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { CostOptimization, Budget } from '../types/cost-optimization.types';
import { ISODateString } from '../types/racine-core.types';

interface UseCostOptimizationReturn {
  costData: CostOptimization | null;
  isLoading: boolean;
  error: string | null;
  implementOptimization: (opportunityId: string) => Promise<any>;
  createBudget: (budget: Omit<Budget, "id" | "spent" | "remaining">) => Promise<Budget>;
  generateCostReport: (timeRange: { start: ISODateString; end: ISODateString }, categories?: string[]) => Promise<any>;
  refreshCostData: () => Promise<void>;
}

export const useCostOptimization = (): UseCostOptimizationReturn => {
  const [costData, setCostData] = useState<CostOptimization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchCostData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    const attemptFetch = async (): Promise<void> => {
      try {
        const response = await fetch('/api/racine/cost/data', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        if (!response.ok) {
          if (response.status === 502 && retryCount < maxRetries) {
            // Bad Gateway - retry after delay
            retryCount++;
            console.warn(`Cost data fetch attempt ${retryCount} failed with Bad Gateway, retrying...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
            return attemptFetch();
          }
          
          // For other errors or max retries reached, provide fallback data
          console.warn(`Cost data fetch failed: ${response.status} ${response.statusText}`);
          setCostData({
            currentCosts: {
              total: 0,
              breakdown: [],
              trends: [],
              projections: [],
            },
            optimizations: {
              identified: [],
              implemented: [],
              recommended: [],
            },
            budgets: {
              allocated: [],
              alerts: [],
              forecasts: [],
            },
            policies: {
              spending: [],
              approval: [],
              allocation: [],
            },
          });
        } else {
          const data = await response.json();
          setCostData(data);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cost data';
        
        if (retryCount < maxRetries) {
          // Network error - retry after delay
          retryCount++;
          console.warn(`Cost data fetch attempt ${retryCount} failed with network error, retrying...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
          return attemptFetch();
        }
        
        // Max retries reached, provide fallback data
        setError(`Network error after ${maxRetries} attempts. Using fallback data.`);
        console.error('Cost data fetch error after retries:', err);
        
        setCostData({
          currentCosts: {
            total: 0,
            breakdown: [],
            trends: [],
            projections: [],
          },
          optimizations: {
            identified: [],
            implemented: [],
            recommended: [],
          },
          budgets: {
            allocated: [],
            alerts: [],
            forecasts: [],
          },
          policies: {
            spending: [],
            approval: [],
            allocation: [],
          },
        });
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    await attemptFetch();
  }, []);

  const implementOptimization = useCallback(async (opportunityId: string) => {
    try {
      const response = await fetch(`/api/racine/cost/optimizations/${opportunityId}/implement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to implement optimization: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Refresh cost data after implementation
      await fetchCostData();
      
      return result;
    } catch (err) {
      console.error('Failed to implement optimization:', err);
      throw err;
    }
  }, [fetchCostData]);

  const createBudget = useCallback(
    async (budget: Omit<Budget, "id" | "spent" | "remaining">) => {
      try {
        const response = await fetch('/api/racine/cost/budgets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify(budget),
        });

        if (!response.ok) {
          throw new Error(`Failed to create budget: ${response.statusText}`);
        }

        const newBudget = await response.json();
        
        // Refresh cost data after budget creation
        await fetchCostData();
        
        return newBudget;
      } catch (err) {
        console.error('Failed to create budget:', err);
        throw err;
      }
    },
    [fetchCostData]
  );

  const generateCostReport = useCallback(
    async (
      timeRange: { start: ISODateString; end: ISODateString },
      categories?: string[]
    ) => {
      try {
        const response = await fetch('/api/racine/cost/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ timeRange, categories }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate cost report: ${response.statusText}`);
        }

        const report = await response.json();
        return report;
      } catch (err) {
        console.error('Failed to generate cost report:', err);
        throw err;
      }
    },
    []
  );

  const refreshCostData = useCallback(async () => {
    await fetchCostData();
  }, [fetchCostData]);

  // Initial data fetch and periodic refresh
  useEffect(() => {
    const mountTimer = setTimeout(fetchCostData, 750);
    const interval = setInterval(fetchCostData, 120000); // 2 minutes
    
    return () => {
      clearTimeout(mountTimer);
      clearInterval(interval);
    };
  }, [fetchCostData]);

  return {
    costData,
    isLoading,
    error,
    implementOptimization,
    createBudget,
    generateCostReport,
    refreshCostData,
  };
};