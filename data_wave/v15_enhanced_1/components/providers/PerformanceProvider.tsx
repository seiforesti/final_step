"use client";

import React, { createContext, useContext, useState } from "react";
import { useToast } from "../ui/use-toast";
import PerformanceMonitor from "../PerformanceMonitor";

interface PerformanceContextType {
  isMonitoringEnabled: boolean;
  toggleMonitoring: () => void;
  setMonitoringEnabled: (enabled: boolean) => void;
}

const PerformanceContext = createContext<PerformanceContextType>({
  isMonitoringEnabled: false,
  toggleMonitoring: () => {},
  setMonitoringEnabled: () => {},
});

export const usePerformance = () => useContext(PerformanceContext);

export function PerformanceProvider({
  children,
  initialEnabled = false,
}: {
  children: React.ReactNode;
  initialEnabled?: boolean;
}) {
  const [isMonitoringEnabled, setMonitoringEnabled] = useState(initialEnabled);
  const { toast } = useToast();

  const handlePerformanceAlert = (recommendations: string[]) => {
    const criticalIssues = recommendations.filter((r) =>
      r.startsWith("Critical")
    );
    if (criticalIssues.length > 0) {
      toast({
        title: "Performance Alert",
        description: criticalIssues[0],
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <PerformanceContext.Provider
      value={{
        isMonitoringEnabled,
        toggleMonitoring: () => setMonitoringEnabled((prev) => !prev),
        setMonitoringEnabled,
      }}
    >
      {children}
      {isMonitoringEnabled && (
        <PerformanceMonitor
          showRecommendations={true}
          onPerformanceAlert={handlePerformanceAlert}
          minimized={true}
        />
      )}
    </PerformanceContext.Provider>
  );
}
