'use client';

import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatNumber } from '@/lib/utils';

interface OverviewData {
  activity_timeline: Array<{
    date: string;
    scans: number;
    classifications: number;
    compliance_checks: number;
  }>;
  scan_status_distribution: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  performance_metrics: {
    average_response_time_ms: number;
    throughput_per_hour: number;
    error_rate_percent: number;
    cache_hit_rate_percent: number;
  };
  recent_activities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: string;
    user: string;
  }>;
}

export function DashboardOverview() {
  const { data: overview, isLoading, error } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const response = await apiClient.get<OverviewData>('/api/v1/dashboard/overview');
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card p-6">
          <LoadingSpinner size="lg" text="Loading dashboard overview..." />
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="card p-6">
        <div className="flex items-center space-x-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>Failed to load dashboard overview</span>
        </div>
      </div>
    );
  }

  const COLORS = ['#FF3621', '#00A972', '#FF8A00', '#1B3139', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Activity Timeline Chart */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Activity Timeline</h3>
              <p className="text-sm text-muted-foreground">System activity over the last 7 days</p>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <div className="card-content">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview.activity_timeline}>
                <defs>
                  <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3621" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF3621" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="classificationsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A972" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00A972" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8A00" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF8A00" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stackId="1"
                  stroke="#FF3621"
                  fill="url(#scansGradient)"
                  name="Scans"
                />
                <Area
                  type="monotone"
                  dataKey="classifications"
                  stackId="1"
                  stroke="#00A972"
                  fill="url(#classificationsGradient)"
                  name="Classifications"
                />
                <Area
                  type="monotone"
                  dataKey="compliance_checks"
                  stackId="1"
                  stroke="#FF8A00"
                  fill="url(#complianceGradient)"
                  name="Compliance Checks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Metrics and Scan Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Performance Metrics</h3>
                <p className="text-sm text-muted-foreground">Real-time system performance</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-foreground">
                  {overview.performance_metrics.average_response_time_ms}ms
                </p>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-foreground">
                  {formatNumber(overview.performance_metrics.throughput_per_hour)}
                </p>
                <p className="text-sm text-muted-foreground">Throughput/Hour</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-foreground">
                  {overview.performance_metrics.error_rate_percent.toFixed(2)}%
                </p>
                <p className="text-sm text-muted-foreground">Error Rate</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-foreground">
                  {overview.performance_metrics.cache_hit_rate_percent.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scan Status Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Scan Status Distribution</h3>
              <p className="text-sm text-muted-foreground">Current scan job statuses</p>
            </div>
          </div>
          <div className="card-content">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overview.scan_status_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {overview.scan_status_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {overview.scan_status_distribution.map((item, index) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm capitalize text-foreground">{item.status}</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatNumber(item.count)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}