/**
 * Advanced Metrics Visualization Component
 * =======================================
 *
 * This component provides comprehensive visualization of analytics metrics including
 * data volume, user activity, system performance, compliance metrics, and cost optimization.
 * Features interactive drill-down capabilities and real-time updates.
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Database,
  DollarSign,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '../../utils/ui-utils';
import { formatBytes, formatNumber } from '../../utils/formatting-utils';
import { AnalyticsMetrics } from '../../types/advanced-analytics.types';

interface AdvancedMetricsVisualizationProps {
  metrics: AnalyticsMetrics;
  timeRange: string;
  onDrillDown: (metric: string) => void;
  className?: string;
}

export const AdvancedMetricsVisualization: React.FC<AdvancedMetricsVisualizationProps> = ({
  metrics,
  timeRange,
  onDrillDown,
  className,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview');

  const metricCards = useMemo(() => [
    {
      id: 'data_volume',
      title: 'Data Volume',
      icon: Database,
      value: formatBytes(metrics.dataVolume.processed),
      subValue: `${formatBytes(metrics.dataVolume.ingested)} ingested`,
      trend: metrics.dataVolume.trend,
      color: 'blue',
      progress: Math.min((metrics.dataVolume.processed / metrics.dataVolume.ingested) * 100, 100),
    },
    {
      id: 'user_activity',
      title: 'User Activity',
      icon: Users,
      value: metrics.userActivity.activeUsers.toString(),
      subValue: `${metrics.userActivity.sessionsToday} sessions today`,
      trend: 'up' as const,
      color: 'green',
      progress: Math.min((metrics.userActivity.activeUsers / 100) * 100, 100),
    },
    {
      id: 'system_performance',
      title: 'System Performance',
      icon: Zap,
      value: `${metrics.systemPerformance.uptime}%`,
      subValue: `${metrics.systemPerformance.averageResponseTime}ms avg`,
      trend: metrics.systemPerformance.uptime > 99 ? 'up' : 'stable',
      color: 'purple',
      progress: metrics.systemPerformance.uptime,
    },
    {
      id: 'compliance_metrics',
      title: 'Compliance Score',
      icon: Shield,
      value: `${metrics.complianceMetrics.overallScore}%`,
      subValue: `${metrics.complianceMetrics.violations} violations`,
      trend: metrics.complianceMetrics.violations === 0 ? 'up' : 'down',
      color: 'orange',
      progress: metrics.complianceMetrics.overallScore,
    },
    {
      id: 'cost_optimization',
      title: 'Cost Efficiency',
      icon: DollarSign,
      value: `${metrics.costOptimization.efficiency}%`,
      subValue: `$${formatNumber(metrics.costOptimization.projectedSavings)} savings`,
      trend: 'up' as const,
      color: 'pink',
      progress: metrics.costOptimization.efficiency,
    },
  ], [metrics]);

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30',
        border: 'border-blue-200/50 dark:border-blue-800/50',
        text: 'text-blue-700 dark:text-blue-300',
        value: 'text-blue-900 dark:text-blue-100',
        icon: 'text-blue-500',
      },
      green: {
        bg: 'from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30',
        border: 'border-green-200/50 dark:border-green-800/50',
        text: 'text-green-700 dark:text-green-300',
        value: 'text-green-900 dark:text-green-100',
        icon: 'text-green-500',
      },
      purple: {
        bg: 'from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30',
        border: 'border-purple-200/50 dark:border-purple-800/50',
        text: 'text-purple-700 dark:text-purple-300',
        value: 'text-purple-900 dark:text-purple-100',
        icon: 'text-purple-500',
      },
      orange: {
        bg: 'from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30',
        border: 'border-orange-200/50 dark:border-orange-800/50',
        text: 'text-orange-700 dark:text-orange-300',
        value: 'text-orange-900 dark:text-orange-100',
        icon: 'text-orange-500',
      },
      pink: {
        bg: 'from-pink-50 to-pink-100/50 dark:from-pink-950/50 dark:to-pink-900/30',
        border: 'border-pink-200/50 dark:border-pink-800/50',
        text: 'text-pink-700 dark:text-pink-300',
        value: 'text-pink-900 dark:text-pink-100',
        icon: 'text-pink-500',
      },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default:
        return <Activity className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Advanced Metrics Overview
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Comprehensive analytics for {timeRange}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white/50 dark:bg-gray-900/50">
            Real-time Data
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
          >
            {viewMode === 'overview' ? 'Detailed View' : 'Overview'}
          </Button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {metricCards.map((metric, index) => {
          const colors = getColorClasses(metric.color);
          const Icon = metric.icon;
          
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => onDrillDown(metric.id)}
            >
              <Card className={cn(
                'bg-gradient-to-br hover:shadow-lg transition-all duration-300',
                colors.bg,
                colors.border,
                selectedMetric === metric.id && 'ring-2 ring-blue-500'
              )}>
                <CardHeader className="pb-2">
                  <CardTitle className={cn('text-sm font-medium flex items-center gap-2', colors.text)}>
                    <Icon className={cn('w-4 h-4', colors.icon)} />
                    {metric.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={cn('text-2xl font-bold', colors.value)}>
                        {metric.value}
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(metric.trend)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className={cn('text-xs', colors.text)}>
                        {metric.subValue}
                      </p>
                      <Progress 
                        value={metric.progress} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed View */}
      {viewMode === 'detailed' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Top Actions Chart */}
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Top User Actions
              </CardTitle>
              <CardDescription>
                Most frequently performed actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.userActivity.topActions.slice(0, 5).map((action, index) => (
                  <div key={action.action} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {action.action}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.max(10, (action.count / Math.max(...metrics.userActivity.topActions.map(a => a.count))) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 min-w-[2rem]">
                        {action.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Breakdown */}
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Performance Breakdown
              </CardTitle>
              <CardDescription>
                Detailed system performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600 dark:text-gray-400">
                      Response Time
                    </label>
                    <div className="flex items-center gap-2">
                      <Progress value={Math.max(0, 100 - (metrics.systemPerformance.averageResponseTime / 10))} className="flex-1 h-2" />
                      <span className="text-sm font-medium">
                        {metrics.systemPerformance.averageResponseTime}ms
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600 dark:text-gray-400">
                      Throughput
                    </label>
                    <div className="flex items-center gap-2">
                      <Progress value={Math.min(100, (metrics.systemPerformance.throughput / 1000) * 100)} className="flex-1 h-2" />
                      <span className="text-sm font-medium">
                        {formatNumber(metrics.systemPerformance.throughput)}/s
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Error Rate:</span>
                    <span className={cn(
                      'font-medium',
                      metrics.systemPerformance.errorRate < 1 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {metrics.systemPerformance.errorRate}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};