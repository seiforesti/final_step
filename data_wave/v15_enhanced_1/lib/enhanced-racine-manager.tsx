/**
 * Enhanced Racine Main Manager
 * ==========================
 *
 * Advanced integration wrapper for RacineMainManager with:
 * - Enterprise system integration
 * - Advanced state management
 * - Real-time updates
 * - Security controls
 * - Performance optimization
 * - Cross-group communication
 */

import React, { useEffect } from "react";
import { RacineMainManagerSPA } from "../components/RacineMainManagerSPA";
import {
  EnterpriseProvider,
  useEnterpriseState,
  useEnterpriseAction,
  useEnterpriseQuery,
  useEnterpriseWebSocket,
  useEnterpriseSecurity,
  initializeEnterpriseSystems,
} from "./enterprise-frontend-integration";
import { websocketService } from "./websocket-service";
import { errorSystem } from "./enterprise-error-system";
import { dataProcessor } from "./enterprise-data-processor";
import { cacheSystem } from "./enterprise-cache-system";

// Enhanced Racine Manager Props
interface EnhancedRacineManagerProps {
  initialData?: any;
  config?: {
    enableCache?: boolean;
    enableRealtime?: boolean;
    enableSecurity?: boolean;
    enableAnalytics?: boolean;
  };
}

// Racine Context Hook
const useRacineContext = () => {
  const state = useEnterpriseState((state) => state.racine);
  const dispatch = useEnterpriseAction();
  const { can } = useEnterpriseSecurity();

  // Group Management
  const { data: groups, isLoading: loadingGroups } = useEnterpriseQuery(
    "racine:groups",
    async () => {
      const response = await fetch("/api/groups");
      const data = await response.json();
      return dataProcessor.validate(data, "group-schema");
    },
    { cacheTime: 5 * 60 * 1000 } // Cache for 5 minutes
  );

  // Real-time Updates
  useEnterpriseWebSocket("racine:updates", async (message) => {
    try {
      const validatedData = await dataProcessor.validate(
        message.data,
        "update-schema"
      );
      await dispatch("RACINE_UPDATE", validatedData);
    } catch (error) {
      await errorSystem.handleError(error as Error, "error", {
        service: "RacineManager",
        operation: "websocket-update",
        component: "RealTimeUpdates",
        environment: process.env.NODE_ENV || "development",
        metadata: { messageType: message.type },
      });
    }
  });

  return {
    state,
    dispatch,
    can,
    groups,
    loadingGroups,
  };
};

// Enhanced Inner Component
const EnhancedRacineManagerInner: React.FC = () => {
  const { state, dispatch, can, groups, loadingGroups } = useRacineContext();

  // Initialize Racine-specific features
  useEffect(() => {
    const initializeRacine = async () => {
      try {
        // Set up Racine-specific caches
        cacheSystem.createCache("racine:data", {
          maxSize: 50 * 1024 * 1024, // 50MB
          ttl: 10 * 60 * 1000, // 10 minutes
        });

        // Set up Racine-specific WebSocket channels
        websocketService.subscribe("racine:system", handleSystemMessage);
        websocketService.subscribe("racine:alerts", handleAlertMessage);
        websocketService.subscribe("racine:metrics", handleMetricsMessage);

        // Initialize Racine state
        await dispatch("RACINE_INITIALIZE", {
          timestamp: new Date().toISOString(),
          version: process.env.NEXT_PUBLIC_VERSION,
        });
      } catch (error) {
        await errorSystem.handleError(error as Error, "error", {
          service: "RacineManager",
          operation: "initialization",
          component: "EnhancedRacineManager",
          environment: process.env.NODE_ENV || "development",
          metadata: {},
        });
      }
    };

    initializeRacine();
  }, [dispatch]);

  // Handle system messages
  const handleSystemMessage = async (message: any) => {
    try {
      switch (message.type) {
        case "configuration":
          await handleConfigUpdate(message.data);
          break;
        case "maintenance":
          await handleMaintenanceMode(message.data);
          break;
        case "health":
          await handleHealthUpdate(message.data);
          break;
        default:
          console.warn("Unknown system message type:", message.type);
      }
    } catch (error) {
      console.error("Error handling system message:", error);
    }
  };

  // Handle alert messages
  const handleAlertMessage = async (message: any) => {
    try {
      const validatedAlert = await dataProcessor.validate(
        message,
        "alert-schema"
      );
      await dispatch("RACINE_ALERT", validatedAlert);
    } catch (error) {
      console.error("Error handling alert message:", error);
    }
  };

  // Handle metrics messages
  const handleMetricsMessage = async (message: any) => {
    try {
      const validatedMetrics = await dataProcessor.validate(
        message,
        "metrics-schema"
      );
      await dispatch("RACINE_METRICS_UPDATE", validatedMetrics);
    } catch (error) {
      console.error("Error handling metrics message:", error);
    }
  };

  // Configuration update handler
  const handleConfigUpdate = async (config: any) => {
    try {
      if (can("manage:configuration")) {
        const validatedConfig = await dataProcessor.validate(
          config,
          "config-schema"
        );
        await dispatch("RACINE_CONFIG_UPDATE", validatedConfig);
      }
    } catch (error) {
      console.error("Error handling config update:", error);
    }
  };

  // Maintenance mode handler
  const handleMaintenanceMode = async (data: any) => {
    try {
      if (can("manage:system")) {
        const validatedData = await dataProcessor.validate(
          data,
          "maintenance-schema"
        );
        await dispatch("RACINE_MAINTENANCE_MODE", validatedData);
      }
    } catch (error) {
      console.error("Error handling maintenance mode:", error);
    }
  };

  // Health update handler
  const handleHealthUpdate = async (health: any) => {
    try {
      const validatedHealth = await dataProcessor.validate(
        health,
        "health-schema"
      );
      await dispatch("RACINE_HEALTH_UPDATE", validatedHealth);
    } catch (error) {
      console.error("Error handling health update:", error);
    }
  };

  // Render enhanced RacineMainManagerSPA
  return (
    <RacineMainManagerSPA
      state={state}
      onAction={async (action, payload) => {
        if (can(`racine:${action}`)) {
          try {
            const validatedPayload = await dataProcessor.validate(
              payload,
              `${action}-schema`
            );
            await dispatch(action, validatedPayload);
          } catch (error) {
            await errorSystem.handleError(error as Error, "error", {
              service: "RacineManager",
              operation: action,
              component: "UserAction",
              environment: process.env.NODE_ENV || "development",
              metadata: { action, payload },
            });
          }
        }
      }}
      groups={groups}
      loading={loadingGroups}
      permissions={{
        canManageUsers: can("manage:users"),
        canManageGroups: can("manage:groups"),
        canManageSettings: can("manage:settings"),
        canViewMetrics: can("view:metrics"),
        canExportData: can("export:data"),
      }}
    />
  );
};

// Main Enhanced Component
export const EnhancedRacineManager: React.FC<EnhancedRacineManagerProps> = ({
  initialData,
  config,
}) => {
  // Initialize enterprise systems
  useEffect(() => {
    initializeEnterpriseSystems().catch(console.error);
  }, []);

  return (
    <EnterpriseProvider
      initialState={{
        racine: initialData || {},
      }}
      config={config}
    >
      <EnhancedRacineManagerInner />
    </EnterpriseProvider>
  );
};

// Export enhanced manager as default
export default EnhancedRacineManager;
