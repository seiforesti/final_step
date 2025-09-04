"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Types
interface RoutingContextType {
  currentRoute: string;
  navigate: (path: string) => void;
  goBack: () => void;
  goForward: () => void;
  refresh: () => void;
  isNavigating: boolean;
}

// Context
const RoutingContext = createContext<RoutingContextType | null>(null);

// Hook
export const useRacineRouting = () => {
  const context = useContext(RoutingContext);
  if (!context) {
    throw new Error('useRacineRouting must be used within RacineRouterProvider');
  }
  return context;
};

// Provider Component
interface RacineRouterProviderProps {
  children: ReactNode;
}

export const RacineRouterProvider: React.FC<RacineRouterProviderProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = (path: string) => {
    setIsNavigating(true);
    router.push(path);
  };

  const goBack = () => {
    setIsNavigating(true);
    router.back();
  };

  const goForward = () => {
    setIsNavigating(true);
    router.forward();
  };

  const refresh = () => {
    setIsNavigating(true);
    router.refresh();
  };

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  const contextValue: RoutingContextType = {
    currentRoute: pathname,
    navigate,
    goBack,
    goForward,
    refresh,
    isNavigating,
  };

  return (
    <RoutingContext.Provider value={contextValue}>
      {children}
    </RoutingContext.Provider>
  );
};
