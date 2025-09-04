"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ANALYTICS_METRICS } from '../../constants/workflow-analytics';
import { calculateTrend, calculateMovingAverage, formatMetricValue } from '../../utils/workflow-analytics';

interface WorkflowTrendsPanelProps {
  timeSeries?: Record<string, number[]>;
  className?: string;
}

export const WorkflowTrendsPanel: React.FC<WorkflowTrendsPanelProps> = ({
  timeSeries = {
    [ANALYTICS_METRICS.EXECUTION_TIME]: [1200, 1300, 1100, 1000, 950, 980, 1020, 990],
    [ANALYTICS_METRICS.SUCCESS_RATE]: [0.96, 0.95, 0.97, 0.98, 0.97, 0.96, 0.97, 0.98]
  },
  className = ''
}) => {
  const trendData = useMemo(() => {
    const entries = Object.entries(timeSeries).map(([metric, values]) => {
      const { trend, slope, confidence, change } = calculateTrend(values, Math.min(values.length, 7));
      const movingAvg = calculateMovingAverage(values, Math.min(values.length, 3));
      return { metric, trend, slope, confidence, change, movingAvg };
    });
    return entries;
  }, [timeSeries]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Trend Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendData.map((item) => (
                <Card key={item.metric} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-muted-foreground capitalize">{item.metric.replace(/_/g, ' ')}</div>
                    <Badge variant={item.trend === 'increasing' ? 'destructive' : item.trend === 'decreasing' ? 'default' : 'secondary'}>
                      {item.trend}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Slope: {item.slope.toFixed(3)} | Confidence: {(item.confidence * 100).toFixed(1)}% | Change: {item.change.toFixed(1)}%
                  </div>
                  <div className="mt-2 text-xs">
                    Latest: {formatMetricValue(timeSeries[item.metric][timeSeries[item.metric].length - 1], item.metric)}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-3">
            {trendData.map((item) => (
              <div key={item.metric} className="p-3 border rounded">
                <div className="text-sm font-medium capitalize mb-1">{item.metric.replace(/_/g, ' ')}</div>
                <div className="text-xs text-muted-foreground">
                  Moving average ({item.movingAvg.length} pts): {item.movingAvg.map(v => formatMetricValue(v, item.metric)).join(', ')}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

