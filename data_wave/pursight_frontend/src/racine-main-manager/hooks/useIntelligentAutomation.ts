/**
 * Intelligent Automation Hook - Advanced Automation and Workflow Management
 * =========================================================================
 *
 * This hook provides comprehensive automation capabilities including rule creation,
 * execution management, workflow orchestration, and intelligent scheduling.
 * Integrates with backend automation services with proper error handling.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AutomationRule, AutomationExecution } from '../types/advanced-analytics.types';

interface UseIntelligentAutomationReturn {
  automationRules: AutomationRule[];
  activeExecutions: AutomationExecution[];
  executionHistory: AutomationExecution[];
  isLoading: boolean;
  error: string | null;
  createAutomationRule: (rule: Omit<AutomationRule, "id" | "lastExecuted" | "executionCount" | "successRate" | "averageExecutionTime">) => Promise<AutomationRule>;
  executeRule: (ruleId: string, parameters?: Record<string, any>) => Promise<AutomationExecution>;
  pauseExecution: (executionId: string) => Promise<void>;
  refreshAutomation: () => Promise<void>;
}

export const useIntelligentAutomation = (): UseIntelligentAutomationReturn => {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [activeExecutions, setActiveExecutions] = useState<AutomationExecution[]>([]);
  const [executionHistory, setExecutionHistory] = useState<AutomationExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchAutomationData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    const attemptFetch = async (): Promise<void> => {
      try {
        const response = await fetch('/api/racine/automation/data', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        if (!response.ok) {
          if (response.status === 502 && retryCount < maxRetries) {
            // Bad Gateway - retry after delay
            retryCount++;
            console.warn(`Automation data fetch attempt ${retryCount} failed with Bad Gateway, retrying...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
            return attemptFetch();
          }
          
          // For other errors or max retries reached, provide fallback data
          console.warn(`Automation data fetch failed: ${response.status} ${response.statusText}`);
          setAutomationRules([]);
          setActiveExecutions([]);
          setExecutionHistory([]);
        } else {
          const [rulesData, executionsData, historyData] = await Promise.all([
            response.json(),
            fetch('/api/racine/automation/executions').then(r => r.ok ? r.json() : []),
            fetch('/api/racine/automation/history').then(r => r.ok ? r.json() : [])
          ]);
          
          setAutomationRules(rulesData);
          setActiveExecutions(executionsData);
          setExecutionHistory(historyData);
        }
      } catch (err) {
        if (retryCount < maxRetries) {
          // Network error - retry after delay
          retryCount++;
          console.warn(`Automation data fetch attempt ${retryCount} failed with network error, retrying...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
          return attemptFetch();
        }
        
        // Max retries reached, provide fallback data
        setError(`Network error after ${maxRetries} attempts. Using fallback data.`);
        console.error('Automation data fetch error after retries:', err);
        
        setAutomationRules([]);
        setActiveExecutions([]);
        setExecutionHistory([]);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    await attemptFetch();
  }, []);

  const createAutomationRule = useCallback(
    async (rule: Omit<AutomationRule, "id" | "lastExecuted" | "executionCount" | "successRate" | "averageExecutionTime">) => {
      try {
        const response = await fetch('/api/racine/automation/rules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify(rule),
        });

        if (!response.ok) {
          throw new Error(`Failed to create automation rule: ${response.statusText}`);
        }

        const newRule = await response.json();
        setAutomationRules(prev => [...prev, newRule]);
        return newRule;
      } catch (err) {
        console.error('Failed to create automation rule:', err);
        throw err;
      }
    },
    []
  );

  const executeRule = useCallback(
    async (ruleId: string, parameters?: Record<string, any>) => {
      try {
        const response = await fetch(`/api/racine/automation/rules/${ruleId}/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ parameters }),
        });

        if (!response.ok) {
          throw new Error(`Failed to execute automation rule: ${response.statusText}`);
        }

        const execution = await response.json();
        setActiveExecutions(prev => [...prev, execution]);
        return execution;
      } catch (err) {
        console.error('Failed to execute automation rule:', err);
        throw err;
      }
    },
    []
  );

  const pauseExecution = useCallback(async (executionId: string) => {
    try {
      const response = await fetch(`/api/racine/automation/executions/${executionId}/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to pause execution: ${response.statusText}`);
      }

      setActiveExecutions(prev =>
        prev.map(exec =>
          exec.id === executionId 
            ? { ...exec, status: "cancelled" as const }
            : exec
        )
      );
    } catch (err) {
      console.error('Failed to pause execution:', err);
      throw err;
    }
  }, []);

  const refreshAutomation = useCallback(async () => {
    await fetchAutomationData();
  }, [fetchAutomationData]);

  // Initial data fetch and periodic refresh
  useEffect(() => {
    const mountTimer = setTimeout(fetchAutomationData, 500);
    const interval = setInterval(fetchAutomationData, 30000); // 30 seconds
    
    return () => {
      clearTimeout(mountTimer);
      clearInterval(interval);
    };
  }, [fetchAutomationData]);

  return {
    automationRules,
    activeExecutions,
    executionHistory,
    isLoading,
    error,
    createAutomationRule,
    executeRule,
    pauseExecution,
    refreshAutomation,
  };
};