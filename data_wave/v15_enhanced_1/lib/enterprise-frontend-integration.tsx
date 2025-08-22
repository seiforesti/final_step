/**
 * Enterprise Frontend Integration System
 * ===================================
 *
 * Advanced frontend integration with:
 * - Service orchestration
 * - State management
 * - Real-time updates
 * - Error handling
 * - Security integration
 * - Performance optimization
 * - Caching strategy
 * - Analytics
 */

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { websocketService } from "./websocket-service";
import { crossGroupIntegrationService } from "./cross-group-integration-service";
import { stateManager } from "./advanced-state-management";
import { errorSystem } from "./enterprise-error-system";
import { dataProcessor } from "./enterprise-data-processor";
import { cacheSystem } from "./enterprise-cache-system";
import { securitySystem } from "./enterprise-security-system";

// Context Types
export type EnterpriseContextType = {
  state: any;
  user: any;
  permissions: Set<string>;
  connectionStatus: string;
  metrics: {
    performance: Record<string, number>;
    errors: Record<string, number>;
    cache: Record<string, number>;
  };
};

// Create Context
const EnterpriseContext = createContext<EnterpriseContextType | null>(null);

// Provider Props
interface EnterpriseProviderProps {
  children: React.ReactNode;
  initialState?: any;
  config?: {
    enableCache?: boolean;
    enableRealtime?: boolean;
    enableSecurity?: boolean;
    enableAnalytics?: boolean;
  };
}

// Custom Hooks
export const useEnterprise = () => {
  const context = useContext(EnterpriseContext);
  if (!context) {
    throw new Error("useEnterprise must be used within an EnterpriseProvider");
  }
  return context;
};

export const useEnterpriseState = <T,>(selector: (state: any) => T) => {
  const { state } = useEnterprise();
  return useMemo(() => selector(state), [state, selector]);
};

export const useEnterpriseAction = () => {
  return async (action: string, payload: any) => {
    try {
      // Validate action permissions
      await securitySystem.checkPermission(
        "currentUserId",
        `action/${action}`,
        "execute"
      );

      // Process data
      const validatedPayload = await dataProcessor.validate(payload, action);

      // Dispatch to state manager
      await stateManager.dispatch({
        type: action,
        payload: validatedPayload,
      });

      // Cache result if needed
      await cacheSystem.set("actions", action, {
        timestamp: Date.now(),
        payload: validatedPayload,
      });
    } catch (error) {
      await errorSystem.handleError(error as Error, "error", {
        service: "FrontendIntegration",
        operation: "action",
        component: action,
        environment: process.env.NODE_ENV || "development",
        metadata: { action, payload },
      });
      throw error;
    }
  };
};

export const useEnterpriseQuery = <T,>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: {
    enabled?: boolean;
    cacheTime?: number;
    staleTime?: number;
    retry?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!options.enabled) return;

      try {
        setIsLoading(true);

        // Check cache first
        const cached = await cacheSystem.get<T>("queries", queryKey);
        if (cached) {
          setData(cached);
          return;
        }

        // Execute query
        const result = await queryFn();

        // Cache result
        await cacheSystem.set("queries", queryKey, result, {
          ttl: options.cacheTime || 5 * 60 * 1000,
        });

        setData(result);
        options.onSuccess?.(result);
      } catch (err) {
        setError(err as Error);
        options.onError?.(err as Error);

        await errorSystem.handleError(err as Error, "error", {
          service: "FrontendIntegration",
          operation: "query",
          component: queryKey,
          environment: process.env.NODE_ENV || "development",
          metadata: { queryKey, options },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [queryKey, options.enabled]);

  return { data, error, isLoading };
};

export const useEnterpriseWebSocket = (
  channel: string,
  handler: (message: any) => void
) => {
  useEffect(() => {
    const unsubscribe = websocketService.subscribe(channel, handler);
    return () => unsubscribe();
  }, [channel, handler]);
};

export const useEnterpriseSecurity = () => {
  const [permissions, setPermissions] = React.useState(new Set<string>());

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const userPermissions = await securitySystem.getUserPermissions(
          "currentUserId"
        );
        setPermissions(new Set(userPermissions.map((p) => p.id)));
      } catch (error) {
        console.error("Failed to load permissions:", error);
      }
    };

    loadPermissions();
  }, []);

  return {
    can: (permission: string) => permissions.has(permission),
    permissions,
  };
};

// Main Provider Component
export const EnterpriseProvider: React.FC<EnterpriseProviderProps> = ({
  children,
  initialState = {},
  config = {
    enableCache: true,
    enableRealtime: true,
    enableSecurity: true,
    enableAnalytics: true,
  },
}) => {
  // Initialize state
  useEffect(() => {
    stateManager.dispatch({
      type: "INITIALIZE",
      payload: initialState,
    });
  }, [initialState]);

  // Initialize caching
  useEffect(() => {
    if (config.enableCache) {
      cacheSystem.createCache("queries", {
        maxSize: 50 * 1024 * 1024, // 50MB
        ttl: 5 * 60 * 1000, // 5 minutes
      });
      cacheSystem.createCache("actions", {
        maxSize: 20 * 1024 * 1024, // 20MB
        ttl: 1 * 60 * 1000, // 1 minute
      });
    }
  }, [config.enableCache]);

  // Initialize WebSocket
  useEffect(() => {
    if (config.enableRealtime) {
      websocketService.connect().catch(console.error);
      return () => websocketService.disconnect();
    }
  }, [config.enableRealtime]);

  // Initialize security
  useEffect(() => {
    if (config.enableSecurity) {
      securitySystem.initialize().catch(console.error);
    }
  }, [config.enableSecurity]);

  // Initialize cross-group integration
  useEffect(() => {
    crossGroupIntegrationService.initialize().catch(console.error);
  }, []);

  // Initialize error handling
  useEffect(() => {
    const unsubscribe = errorSystem.subscribe((error) =>
      console.error("Enterprise Error:", error)
    );
    return () => unsubscribe();
  }, []);

  // Context value
  const value = useMemo(
    () => ({
      state: stateManager.getState(),
      user: null, // Will be populated after auth
      permissions: new Set<string>(),
      connectionStatus: websocketService.getState(),
      metrics: {
        performance: {},
        errors: {},
        cache: {},
      },
    }),
    []
  );

  return (
    <EnterpriseContext.Provider value={value}>
      {children}
    </EnterpriseContext.Provider>
  );
};

// HOC for protecting routes/components
export const withEnterpriseSecurity = (
  WrappedComponent: React.ComponentType<any>,
  requiredPermissions: string[]
) => {
  return function WithSecurityComponent(props: any) {
    const { can } = useEnterpriseSecurity();
    const hasPermissions = requiredPermissions.every(can);

    if (!hasPermissions) {
      return <div>Access Denied</div>;
    }

    return <WrappedComponent {...props} />;
  };
};

// Example usage of all systems in a component
export const EnterpriseComponent: React.FC = () => {
  // Use state
  const data = useEnterpriseState((state) => state.data);

  // Use actions
  const dispatchAction = useEnterpriseAction();

  // Use queries
  const { data: queryData, isLoading } = useEnterpriseQuery(
    "example-query",
    () => fetch("/api/data").then((r) => r.json())
  );

  // Use WebSocket
  useEnterpriseWebSocket("updates", (message) => {
    console.log("Received update:", message);
  });

  // Use security
  const { can } = useEnterpriseSecurity();

  // Handle actions
  const handleAction = async () => {
    if (can("perform:action")) {
      await dispatchAction("EXAMPLE_ACTION", { data: "example" });
    }
  };

  return <div>{/* Component implementation */}</div>;
};

// Example of protected route
export const ProtectedRoute = withEnterpriseSecurity(EnterpriseComponent, [
  "view:data",
  "edit:data",
]);

// Initialize all systems
export const initializeEnterpriseSystems = async () => {
  try {
    // Initialize caching system
    await cacheSystem.initialize();

    // Initialize state management
    await stateManager.initialize();

    // Initialize WebSocket connection
    await websocketService.connect();

    // Initialize security system
    await securitySystem.initialize();

    // Initialize cross-group integration
    await crossGroupIntegrationService.initialize();

    // Initialize data processor
    await dataProcessor.initialize();

    console.log("Enterprise systems initialized successfully");
  } catch (error) {
    console.error("Failed to initialize enterprise systems:", error);
    throw error;
  }
};
