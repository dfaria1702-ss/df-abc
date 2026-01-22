'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { format } from 'date-fns';
import type { MetricSeries } from '@/lib/observability-data';

interface ChartExpandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metric: MetricSeries;
  unit: string;
}

export function ChartExpandModal({
  open,
  onOpenChange,
  metric,
  unit,
}: ChartExpandModalProps) {
  // Transform data for recharts
  const chartData = metric.data.map(point => ({
    timestamp: point.timestamp,
    value: point.value,
    formattedTime: format(new Date(point.timestamp), 'HH:mm'),
    formattedDate: format(new Date(point.timestamp), 'MMM dd, yyyy HH:mm:ss'),
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{metric.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={500}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
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
              <Brush dataKey="formattedTime" height={30} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}

