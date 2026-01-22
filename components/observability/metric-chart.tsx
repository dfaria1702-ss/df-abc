'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import type { MetricSeries } from '@/lib/observability-data';

interface MetricChartProps {
  metric: MetricSeries;
  unit: string;
  isLoading?: boolean;
  onChartClick?: () => void;
}

export function MetricChart({
  metric,
  unit,
  isLoading = false,
  onChartClick,
}: MetricChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Transform data for recharts
  const chartData = metric.data.map(point => ({
    timestamp: point.timestamp,
    value: point.value,
    formattedTime: format(new Date(point.timestamp), 'HH:mm'),
    formattedDate: format(new Date(point.timestamp), 'MMM dd, HH:mm'),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-1">{data.formattedDate}</p>
          <p className="text-sm">
            <span className="text-muted-foreground">{metric.name}:</span>{' '}
            <span className="font-semibold">
              {data.value} {unit}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      className={onChartClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={onChartClick}
    >
      <CardHeader>
        <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="formattedTime"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              label={{ value: unit, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

