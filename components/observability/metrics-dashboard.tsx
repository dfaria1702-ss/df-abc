'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MetricChart } from './metric-chart';
import { ChartExpandModal } from './chart-expand-modal';
import type { MetricSeries, MetricsData } from '@/lib/observability-data';
import { format } from 'date-fns';

interface MetricsDashboardProps {
  metricsData: MetricsData | null;
  metrics: { id: string; name: string; unit: string }[];
  isLoading: boolean;
  selectedResource: string | null;
}

export function MetricsDashboard({
  metricsData,
  metrics,
  isLoading,
  selectedResource,
}: MetricsDashboardProps) {
  const [expandedChart, setExpandedChart] = useState<{
    metric: MetricSeries;
    unit: string;
  } | null>(null);

  if (!selectedResource) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Select a resource to view metrics
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map(metric => (
            <Card key={metric.id}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">{metric.name}</h3>
                  <Skeleton className="h-[200px] w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map(metric => (
            <MetricChart
              key={metric.id}
              metric={{ name: metric.name, data: [] }}
              unit={metric.unit}
              isLoading={true}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!metricsData || !metricsData.metrics.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No metrics data available</p>
      </div>
    );
  }

  const handleChartClick = (metric: MetricSeries, unit: string) => {
    setExpandedChart({ metric, unit });
  };

  return (
    <div className="space-y-4">
      {metricsData.lastUpdated && (
        <div className="text-sm text-muted-foreground">
          Last updated at:{' '}
          {format(new Date(metricsData.lastUpdated), 'MMM dd, yyyy HH:mm:ss')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metricConfig, index) => {
          const metricSeries = metricsData.metrics[index];
          if (!metricSeries) return null;

          return (
            <MetricChart
              key={metricConfig.id}
              metric={metricSeries}
              unit={metricConfig.unit}
              onChartClick={() => handleChartClick(metricSeries, metricConfig.unit)}
            />
          );
        })}
      </div>

      {expandedChart && (
        <ChartExpandModal
          open={!!expandedChart}
          onOpenChange={(open) => !open && setExpandedChart(null)}
          metric={expandedChart.metric}
          unit={expandedChart.unit}
        />
      )}
    </div>
  );
}

