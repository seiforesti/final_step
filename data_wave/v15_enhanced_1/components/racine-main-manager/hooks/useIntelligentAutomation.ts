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

    try {
      setIsLoading(true);
      setError(null);

      // Fetch automation rules
      const rulesResponse = await fetch('/api/racine/automation/rules', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      // Fetch active executions
      const executionsResponse = await fetch('/api/racine/automation/executions/active', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      // Fetch execution history
      const historyResponse = await fetch('/api/racine/automation/executions/history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!rulesResponse.ok || !executionsResponse.ok || !historyResponse.ok) {
        if (rulesResponse.status === 404 || rulesResponse.status === 503) {
          // Backend not available, provide graceful fallback
          setAutomationRules([]);
          setActiveExecutions([]);
          setExecutionHistory([]);
        } else {
          throw new Error('Failed to fetch automation data');
        }
      } else {
        const [rulesData, executionsData, historyData] = await Promise.all([
          rulesResponse.json(),
          executionsResponse.json(),
          historyResponse.json(),
        ]);

        setAutomationRules(rulesData);
        setActiveExecutions(executionsData);
        setExecutionHistory(historyData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch automation data';
      setError(errorMessage);
      console.error('Automation data fetch error:', err);
      
      // Provide fallback data on error
      setAutomationRules([]);
      setActiveExecutions([]);
      setExecutionHistory([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
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