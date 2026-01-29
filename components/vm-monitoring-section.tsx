'use client';

import { useState, useEffect, useCallback } from 'react';
import { MetricsDashboard } from './observability/metrics-dashboard';
import { vmMetrics, fetchVMMetrics } from '@/lib/observability-data';
import type { MetricsData } from '@/lib/observability-data';

interface VMMonitoringSectionProps {
  vmName: string;
  defaultTimeRange?: number; // in hours, default 24
  defaultGranularity?: number; // in minutes, default 1
}

export function VMMonitoringSection({
  vmName,
  defaultTimeRange = 24,
  defaultGranularity = 1,
}: VMMonitoringSectionProps) {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch metrics data
  const loadMetrics = useCallback(async () => {
    if (!vmName) {
      setMetricsData(null);
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchVMMetrics(vmName, defaultTimeRange, defaultGranularity);
      setMetricsData(data);
    } catch (error) {
      console.error('Failed to fetch VM metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [vmName, defaultTimeRange, defaultGranularity]);

  // Initial load
  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // Auto-refresh based on granularity
  useEffect(() => {
    if (!vmName) return;

    const intervalMs = defaultGranularity * 60 * 1000; // Convert minutes to milliseconds
    const interval = setInterval(() => {
      loadMetrics();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [vmName, defaultGranularity, loadMetrics]);

  return (
    <div className="space-y-6">
      <MetricsDashboard
        metricsData={metricsData}
        metrics={vmMetrics}
        isLoading={isLoading}
        selectedResource={vmName}
      />
    </div>
  );
}

