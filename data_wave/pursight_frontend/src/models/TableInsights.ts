// Table Insights model
export interface TableInsight {
  id: string;
  title: string;
  description: string;
  category: 'usage' | 'quality' | 'security' | 'performance';
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  metrics?: {
    name: string;
    value: number;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
    changePercent?: number;
  }[];
  recommendations?: {
    id: string;
    text: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
  }[];
}

export interface TableUsageMetrics {
  totalQueries: number;
  uniqueUsers: number;
  avgQueriesPerDay: number;
  queryTrend: {
    date: string;
    count: number;
  }[];
  topUsers: {
    userId: string;
    userName: string;
    queryCount: number;
  }[];
  popularJoins: {
    tableName: string;
    joinCount: number;
  }[];
}

export interface TableInsightsData {
  insights: TableInsight[];
  usageMetrics: TableUsageMetrics;
  lastUpdated: string;
}