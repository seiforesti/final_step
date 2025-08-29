'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  Database, 
  Shield, 
  Tags, 
  ScanLine, 
  BookOpen, 
  Workflow, 
  Users, 
  Activity,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatNumber, formatPercentage } from '@/lib/utils';

interface MetricCard {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

interface DashboardMetrics {
  data_sources: {
    total_count: number;
    active_count: number;
    change_percent: number;
  };
  compliance_rules: {
    total_count: number;
    active_count: number;
    change_percent: number;
  };
  classifications: {
    total_count: number;
    processed_count: number;
    change_percent: number;
  };
  scan_rule_sets: {
    total_count: number;
    active_count: number;
    change_percent: number;
  };
  catalog_items: {
    total_count: number;
    cataloged_count: number;
    change_percent: number;
  };
  scan_workflows: {
    total_count: number;
    running_count: number;
    change_percent: number;
  };
  users: {
    total_count: number;
    active_count: number;
    change_percent: number;
  };
  system_health: {
    overall_score: number;
    change_percent: number;
  };
}

export function MetricsCards() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardMetrics>('/api/v1/dashboard/metrics');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="card p-6">
            <LoadingSpinner size="sm" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="card p-6">
        <p className="text-sm text-destructive">Failed to load dashboard metrics</p>
      </div>
    );
  }

  const metricCards: MetricCard[] = [
    {
      title: 'Data Sources',
      value: formatNumber(metrics.data_sources.total_count),
      change: metrics.data_sources.change_percent,
      changeType: metrics.data_sources.change_percent > 0 ? 'increase' : 
                  metrics.data_sources.change_percent < 0 ? 'decrease' : 'neutral',
      icon: Database,
      color: 'text-blue-600',
      description: `${metrics.data_sources.active_count} active`,
    },
    {
      title: 'Compliance Rules',
      value: formatNumber(metrics.compliance_rules.total_count),
      change: metrics.compliance_rules.change_percent,
      changeType: metrics.compliance_rules.change_percent > 0 ? 'increase' : 
                  metrics.compliance_rules.change_percent < 0 ? 'decrease' : 'neutral',
      icon: Shield,
      color: 'text-green-600',
      description: `${metrics.compliance_rules.active_count} active`,
    },
    {
      title: 'Classifications',
      value: formatNumber(metrics.classifications.total_count),
      change: metrics.classifications.change_percent,
      changeType: metrics.classifications.change_percent > 0 ? 'increase' : 
                  metrics.classifications.change_percent < 0 ? 'decrease' : 'neutral',
      icon: Tags,
      color: 'text-purple-600',
      description: `${metrics.classifications.processed_count} processed`,
    },
    {
      title: 'Scan Rule Sets',
      value: formatNumber(metrics.scan_rule_sets.total_count),
      change: metrics.scan_rule_sets.change_percent,
      changeType: metrics.scan_rule_sets.change_percent > 0 ? 'increase' : 
                  metrics.scan_rule_sets.change_percent < 0 ? 'decrease' : 'neutral',
      icon: ScanLine,
      color: 'text-orange-600',
      description: `${metrics.scan_rule_sets.active_count} active`,
    },
    {
      title: 'Catalog Items',
      value: formatNumber(metrics.catalog_items.total_count),
      change: metrics.catalog_items.change_percent,
      changeType: metrics.catalog_items.change_percent > 0 ? 'increase' : 
                  metrics.catalog_items.change_percent < 0 ? 'decrease' : 'neutral',
      icon: BookOpen,
      color: 'text-indigo-600',
      description: `${metrics.catalog_items.cataloged_count} cataloged`,
    },
    {
      title: 'Active Workflows',
      value: formatNumber(metrics.scan_workflows.running_count),
      change: metrics.scan_workflows.change_percent,
      changeType: metrics.scan_workflows.change_percent > 0 ? 'increase' : 
                  metrics.scan_workflows.change_percent < 0 ? 'decrease' : 'neutral',
      icon: Workflow,
      color: 'text-teal-600',
      description: `${metrics.scan_workflows.total_count} total`,
    },
    {
      title: 'Active Users',
      value: formatNumber(metrics.users.active_count),
      change: metrics.users.change_percent,
      changeType: metrics.users.change_percent > 0 ? 'increase' : 
                  metrics.users.change_percent < 0 ? 'decrease' : 'neutral',
      icon: Users,
      color: 'text-pink-600',
      description: `${metrics.users.total_count} total`,
    },
    {
      title: 'System Health',
      value: `${metrics.system_health.overall_score}%`,
      change: metrics.system_health.change_percent,
      changeType: metrics.system_health.change_percent > 0 ? 'increase' : 
                  metrics.system_health.change_percent < 0 ? 'decrease' : 'neutral',
      icon: Activity,
      color: metrics.system_health.overall_score >= 90 ? 'text-green-600' : 
             metrics.system_health.overall_score >= 70 ? 'text-yellow-600' : 'text-red-600',
      description: 'Overall status',
    },
  ];

  const getChangeIcon = (changeType: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getChangeColor = (changeType: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => (
        <div key={index} className="card p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {metric.value}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {metric.description}
            </p>
            
            <div className="flex items-center space-x-1">
              {getChangeIcon(metric.changeType)}
              <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                {formatPercentage(Math.abs(metric.change))}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}