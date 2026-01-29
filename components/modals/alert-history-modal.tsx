'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShadcnDataTable, Column } from '@/components/ui/shadcn-data-table';
import {
  mockTriggeredAlerts,
  TriggeredAlert,
  formatConditionOperator,
} from '@/lib/observability-data';
import { vmMetrics, lbMetrics } from '@/lib/observability-data';

interface AlertHistoryModalProps {
  open: boolean;
  onClose: () => void;
  vmName: string;
}

// Helper function to format timestamp
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).replace(',', '');
}

// Helper function to format duration
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

// Helper function to get metric unit
function getMetricUnit(metricName: string, service: 'VM' | 'LB'): string {
  const metrics = service === 'VM' ? vmMetrics : lbMetrics;
  const metric = metrics.find(m => m.name === metricName);
  return metric ? metric.unit : '';
}

export function AlertHistoryModal({
  open,
  onClose,
  vmName,
}: AlertHistoryModalProps) {
  const [selectedAlertName, setSelectedAlertName] = useState<string>('all');

  // Filter triggered alerts by VM name and last 15 days
  const alertsForVM = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 15);

    return mockTriggeredAlerts.filter(alert => {
      // Match by service type and resource name (case-insensitive)
      const matchesService = alert.service === 'VM';
      const matchesResource = alert.resourceName.toLowerCase() === vmName.toLowerCase();
      
      // Filter by last 15 days
      const alertDate = new Date(alert.triggeredTimestamp);
      const matchesDateRange = alertDate >= cutoffDate;

      return matchesService && matchesResource && matchesDateRange;
    });
  }, [vmName]);

  // Get unique alert names from the filtered alerts
  const uniqueAlertNames = useMemo(() => {
    const names = new Set(alertsForVM.map(alert => alert.alertName));
    return Array.from(names).sort();
  }, [alertsForVM]);

  // Filter by selected alert name
  const filteredAlerts = useMemo(() => {
    if (selectedAlertName === 'all') {
      return alertsForVM;
    }
    return alertsForVM.filter(alert => alert.alertName === selectedAlertName);
  }, [alertsForVM, selectedAlertName]);

  const columns: Column<TriggeredAlert>[] = useMemo(
    () => [
      {
        key: 'triggeredTimestamp',
        label: 'TRIGGERED TIME',
        sortable: true,
        render: (value: string) => (
          <div className="text-sm">{formatTimestamp(value)}</div>
        ),
      },
      {
        key: 'alertName',
        label: 'ALERT',
        sortable: true,
        searchable: true,
        render: (value: string) => (
          <span className="text-sm font-medium">{value}</span>
        ),
      },
      {
        key: 'resourceName',
        label: 'RESOURCE NAME',
        sortable: true,
        render: (value: string, row: TriggeredAlert) => (
          <div className="text-sm">
            <span className="font-medium">{value}</span>
            <span className="text-muted-foreground ml-2">({row.service})</span>
          </div>
        ),
      },
      {
        key: 'condition',
        label: 'CONDITION',
        sortable: false,
        render: (value: string, row: TriggeredAlert) => {
          const operator = formatConditionOperator(value);
          const unit = getMetricUnit(row.metric, row.service);
          return (
            <div className="text-sm font-medium">
              {operator} {row.thresholdValue}
              {unit && <span className="text-muted-foreground ml-1">{unit}</span>}
            </div>
          );
        },
      },
      {
        key: 'averageValue',
        label: 'AVERAGE VALUE',
        sortable: true,
        render: (value: number, row: TriggeredAlert) => {
          const unit = getMetricUnit(row.metric, row.service);
          return (
            <div className="text-sm font-medium">
              {value.toFixed(1)}
              {unit && <span className="text-muted-foreground ml-1">{unit}</span>}
            </div>
          );
        },
      },
      {
        key: 'durationMinutes',
        label: 'DURATION',
        sortable: true,
        render: (value: number) => (
          <div className="text-sm">{formatDuration(value)}</div>
        ),
      },
    ],
    []
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Alert History</DialogTitle>
          <DialogDescription>
            View triggered alert history for {vmName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Filter by Alert Name */}
          <div className="space-y-2">
            <Label htmlFor="alert-name-filter">Filter by Alert Name</Label>
            <Select value={selectedAlertName} onValueChange={setSelectedAlertName}>
              <SelectTrigger id="alert-name-filter" className="max-w-md">
                <SelectValue placeholder="Select an alert..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                {uniqueAlertNames.map(alertName => (
                  <SelectItem key={alertName} value={alertName}>
                    {alertName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alert History Table */}
          <ShadcnDataTable
            columns={columns}
            data={filteredAlerts}
            searchableColumns={['alertName']}
            defaultSort={{ column: 'triggeredTimestamp', direction: 'desc' }}
            pageSize={10}
            enableSearch={false}
            enablePagination={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

