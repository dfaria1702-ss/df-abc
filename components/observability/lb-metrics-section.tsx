'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ControlPanel, type TimeRangeHours, type GranularityMinutes } from './control-panel';
import { MetricsDashboard } from './metrics-dashboard';
import { mockLBNames, lbMetrics, fetchLBMetrics } from '@/lib/observability-data';
import type { MetricsData } from '@/lib/observability-data';
import type { DateRange } from 'react-day-picker';

const STORAGE_KEY_SELECTED_LB = 'observability_selected_lb';
const STORAGE_KEY_LB_TIME_RANGE = 'observability_lb_time_range';
const STORAGE_KEY_LB_GRANULARITY = 'observability_lb_granularity';
const STORAGE_KEY_LB_CUSTOM_RANGE = 'observability_lb_custom_range';

export function LBMetricsSection() {
  const searchParams = useSearchParams();
  
  // Get initial values from URL params or sessionStorage
  const getInitialLB = (): string => {
    if (typeof window !== 'undefined') {
      // Check URL params first
      const urlResource = searchParams?.get('resource');
      if (urlResource) {
        return urlResource;
      }
      // Fall back to sessionStorage
      return sessionStorage.getItem(STORAGE_KEY_SELECTED_LB) || '';
    }
    return '';
  };

  const getInitialTimeRange = (): TimeRangeHours => {
    if (typeof window !== 'undefined') {
      // Check URL params first
      const urlTimeRange = searchParams?.get('timeRange');
      if (urlTimeRange && urlTimeRange !== 'custom') {
        const num = Number(urlTimeRange);
        if (!isNaN(num) && [1, 6, 12, 24, 168].includes(num)) {
          return num as TimeRangeHours;
        }
      }
      // Fall back to sessionStorage or default to 6 hours
      const stored = sessionStorage.getItem(STORAGE_KEY_LB_TIME_RANGE);
      if (stored === 'custom') return 'custom';
      return stored ? (Number(stored) as TimeRangeHours) : 6;
    }
    return 6;
  };

  const getInitialGranularity = (): GranularityMinutes => {
    if (typeof window !== 'undefined') {
      // Check URL params first
      const urlGranularity = searchParams?.get('granularity');
      if (urlGranularity) {
        const num = Number(urlGranularity);
        if (!isNaN(num) && [1, 5, 10, 30, 60].includes(num)) {
          return num as GranularityMinutes;
        }
      }
      // Fall back to sessionStorage or default to 1 min
      const stored = sessionStorage.getItem(STORAGE_KEY_LB_GRANULARITY);
      return stored ? (Number(stored) as GranularityMinutes) : 1;
    }
    return 1;
  };

  // Load persisted state from URL params or sessionStorage
  const [selectedLB, setSelectedLB] = useState<string>(getInitialLB);

  const [pendingTimeRange, setPendingTimeRange] = useState<TimeRangeHours>(getInitialTimeRange);

  const [pendingCustomDateRange, setPendingCustomDateRange] = useState<DateRange | undefined>(() => {
    if (typeof window !== 'undefined' && pendingTimeRange === 'custom') {
      const stored = sessionStorage.getItem(STORAGE_KEY_LB_CUSTOM_RANGE);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return {
            from: parsed.from ? new Date(parsed.from) : undefined,
            to: parsed.to ? new Date(parsed.to) : undefined,
          };
        } catch {
          return undefined;
        }
      }
    }
    return undefined;
  });

  const [pendingGranularity, setPendingGranularity] = useState<GranularityMinutes>(getInitialGranularity);

  // Active config (after confirm)
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRangeHours>(pendingTimeRange);
  const [activeCustomDateRange, setActiveCustomDateRange] = useState<DateRange | undefined>(pendingCustomDateRange);
  const [activeGranularity, setActiveGranularity] = useState<GranularityMinutes>(pendingGranularity);

  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if there are pending changes
  const hasPendingChanges =
    pendingTimeRange !== activeTimeRange ||
    pendingGranularity !== activeGranularity ||
    JSON.stringify(pendingCustomDateRange) !== JSON.stringify(activeCustomDateRange);

  // Calculate time range in hours for API call
  const getTimeRangeHours = (): number => {
    if (activeTimeRange === 'custom' && activeCustomDateRange?.from && activeCustomDateRange?.to) {
      const diffMs = activeCustomDateRange.to.getTime() - activeCustomDateRange.from.getTime();
      return Math.max(1, Math.min(360, diffMs / (1000 * 60 * 60))); // Clamp between 1 hour and 15 days
    }
    return activeTimeRange as number;
  };

  // Fetch metrics data
  const loadMetrics = useCallback(async () => {
    if (!selectedLB) {
      setMetricsData(null);
      return;
    }

    setIsLoading(true);
    try {
      const timeRangeHours = getTimeRangeHours();
      const data = await fetchLBMetrics(selectedLB, timeRangeHours, activeGranularity);
      setMetricsData(data);
    } catch (error) {
      console.error('Failed to fetch LB metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLB, activeTimeRange, activeCustomDateRange, activeGranularity]);

  // Initial load
  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // Auto-refresh based on granularity (only for non-custom ranges)
  useEffect(() => {
    if (!selectedLB || activeTimeRange === 'custom') return;

    const intervalMs = activeGranularity * 60 * 1000; // Convert minutes to milliseconds
    const interval = setInterval(() => {
      loadMetrics();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [selectedLB, activeTimeRange, activeGranularity, loadMetrics]);

  // Handle resource selection
  const handleResourceChange = (value: string) => {
    setSelectedLB(value);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY_SELECTED_LB, value);
    }
  };

  // Initialize from URL params on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && searchParams) {
      const urlResource = searchParams.get('resource');
      const urlTimeRange = searchParams.get('timeRange');
      const urlGranularity = searchParams.get('granularity');

      if (urlResource) {
        setSelectedLB(urlResource);
        sessionStorage.setItem(STORAGE_KEY_SELECTED_LB, urlResource);
      }

      if (urlTimeRange && urlTimeRange !== 'custom') {
        const num = Number(urlTimeRange);
        if (!isNaN(num) && [1, 6, 12, 24, 168].includes(num)) {
          setPendingTimeRange(num as TimeRangeHours);
          setActiveTimeRange(num as TimeRangeHours);
          sessionStorage.setItem(STORAGE_KEY_LB_TIME_RANGE, num.toString());
        }
      }

      if (urlGranularity) {
        const num = Number(urlGranularity);
        if (!isNaN(num) && [1, 5, 10, 30, 60].includes(num)) {
          setPendingGranularity(num as GranularityMinutes);
          setActiveGranularity(num as GranularityMinutes);
          sessionStorage.setItem(STORAGE_KEY_LB_GRANULARITY, num.toString());
        }
      }
    }
  }, [searchParams]);

  // Handle confirm configuration
  const handleConfirm = () => {
    setActiveTimeRange(pendingTimeRange);
    setActiveCustomDateRange(pendingCustomDateRange);
    setActiveGranularity(pendingGranularity);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY_LB_TIME_RANGE, pendingTimeRange.toString());
      sessionStorage.setItem(STORAGE_KEY_LB_GRANULARITY, pendingGranularity.toString());
      if (pendingTimeRange === 'custom' && pendingCustomDateRange) {
        sessionStorage.setItem(
          STORAGE_KEY_LB_CUSTOM_RANGE,
          JSON.stringify({
            from: pendingCustomDateRange.from?.toISOString(),
            to: pendingCustomDateRange.to?.toISOString(),
          })
        );
      } else {
        sessionStorage.removeItem(STORAGE_KEY_LB_CUSTOM_RANGE);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <ControlPanel
            resourceOptions={mockLBNames}
            selectedResource={selectedLB}
            onResourceChange={handleResourceChange}
            resourcePlaceholder="Select a Load Balancer..."
            timeRange={pendingTimeRange}
            customDateRange={pendingCustomDateRange}
            onTimeRangeChange={setPendingTimeRange}
            onCustomDateRangeChange={setPendingCustomDateRange}
            granularity={pendingGranularity}
            onGranularityChange={setPendingGranularity}
            onConfirm={handleConfirm}
            hasPendingChanges={hasPendingChanges}
          />
        </div>
      </div>

      <MetricsDashboard
        metricsData={metricsData}
        metrics={lbMetrics}
        isLoading={isLoading}
        selectedResource={selectedLB}
      />
    </div>
  );
}
