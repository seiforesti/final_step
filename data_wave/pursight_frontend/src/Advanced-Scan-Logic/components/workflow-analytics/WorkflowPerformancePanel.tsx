"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ANALYTICS_METRICS } from '../../constants/workflow-analytics';
import { formatMetricValue, analyzePerformance } from '../../utils/workflow-analytics';

interface WorkflowPerformancePanelProps {
  metricsSeries?: Record<string, number[]>;
  className?: string;
}

export const WorkflowPerformancePanel: React.FC<WorkflowPerformancePanelProps> = ({
  metricsSeries = {
    [ANALYTICS_METRICS.EXECUTION_TIME]: [800, 920, 1100, 980, 1040, 990, 870],
    [ANALYTICS_METRICS.SUCCESS_RATE]: [0.98, 0.97, 0.93, 0.95, 0.96, 0.94, 0.97],
    [ANALYTICS_METRICS.THROUGHPUT]: [1200, 1180, 1250, 1300, 1280, 1270, 1320]
  },
  className = ''
}) => {
  const { summary, recommendations, alerts } = useMemo(() => analyzePerformance(metricsSeries), [metricsSeries]);

  const performanceKeys = [
    ANALYTICS_METRICS.EXECUTION_TIME,
    ANALYTICS_METRICS.SUCCESS_RATE,
    ANALYTICS_METRICS.THROUGHPUT
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {performanceKeys.map((key) => (
                <Card key={key} className="p-4">
                  <div className="mb-2">
                    <div className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</div>
                    <div className="text-xl font-bold">
                      {formatMetricValue(summary[key]?.mean ?? 0, key)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <div className="font-medium">p95</div>
                      <div>{formatMetricValue(summary[key]?.p95 ?? 0, key)}</div>
                    </div>
                    <div>
                      <div className="font-medium">p99</div>
                      <div>{formatMetricValue(summary[key]?.p99 ?? 0, key)}</div>
                    </div>
                    <div>
                      <div className="font-medium">min</div>
                      <div>{formatMetricValue(summary[key]?.min ?? 0, key)}</div>
                    </div>
                    <div>
                      <div className="font-medium">max</div>
                      <div>{formatMetricValue(summary[key]?.max ?? 0, key)}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={Math.min(100, (summary[key]?.p95 ?? 0) / (summary[key]?.max || 1) * 100)} className="h-2" />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-sm text-muted-foreground">No alerts</div>
            ) : (
              alerts.map((a, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="text-sm capitalize">{a.metric.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-muted-foreground">{a.message}</div>
                  </div>
                  <Badge variant={a.level === 'critical' ? 'destructive' : 'secondary'}>{a.level}</Badge>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-2">
            {recommendations.length === 0 ? (
              <div className="text-sm text-muted-foreground">No recommendations</div>
            ) : (
              recommendations.map((r, idx) => (
                <div key={idx} className="p-3 border rounded text-sm">{r}</div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

