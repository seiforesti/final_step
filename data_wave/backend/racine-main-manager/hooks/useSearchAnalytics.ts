// Minimal, safe analytics hook to satisfy GlobalSearchInterface and other consumers
// Returns stable defaults and no-op trackers to avoid runtime errors or freezes

export type SearchUsageEvent = {
  query: string;
  filters?: Record<string, unknown>;
  timestamp?: Date;
  source?: string;
};

export type SearchAnalyticsState = {
  resultPopularity: Record<string, number>;
};

export type PopularSearch = {
  query: string;
  count?: number;
};

export interface UseSearchAnalyticsReturn {
  searchAnalytics: SearchAnalyticsState | null;
  trackSearchUsage: (event: SearchUsageEvent) => void;
  getPopularSearches: (limit?: number) => Promise<PopularSearch[]>;
  getSearchPerformance: () => Promise<{ averageMs: number; p95Ms: number }>;
}

export const useSearchAnalytics = (): UseSearchAnalyticsReturn => {
  // Stable default state; callers treat absent entries as 0
  const searchAnalytics: SearchAnalyticsState = {
    resultPopularity: {},
  };

  const trackSearchUsage = (_event: SearchUsageEvent) => {
    // no-op tracker in diagnostics mode; intentionally silent
  };

  const getPopularSearches = async (limit: number = 10): Promise<PopularSearch[]> => {
    // Provide deterministic, tiny dataset to keep UI stable
    return [
      { query: "workspace" },
      { query: "pipelines" },
      { query: "classifications" },
      { query: "rbac roles" },
      { query: "scan results" },
    ].slice(0, Math.max(0, limit));
  };

  const getSearchPerformance = async () => {
    // Conservative defaults; UI can display without extra calls
    return { averageMs: 120, p95Ms: 380 };
  };

  return {
    searchAnalytics,
    trackSearchUsage,
    getPopularSearches,
    getSearchPerformance,
  };
};

export default useSearchAnalytics;

