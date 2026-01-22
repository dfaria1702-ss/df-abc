'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { VercelTabs } from '@/components/ui/vercel-tabs';
import { Button } from '@/components/ui/button';
import { CreateAlertModal } from '@/components/modals/create-alert-modal';
import { ShadcnDataTable, Column } from '@/components/ui/shadcn-data-table';
import { StatusBadge } from '@/components/status-badge';
import { ActionMenu } from '@/components/action-menu';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { Pause, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  mockConfiguredAlerts,
  mockTriggeredAlerts,
  formatConditionOperator,
  ConfiguredAlert,
  TriggeredAlert,
  vmMetrics,
  lbMetrics,
} from '@/lib/observability-data';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format, subDays, subMonths, startOfMonth } from 'date-fns';
import type { DateRange } from 'react-day-picker';

const tabs = [
  { id: 'configured', label: 'Configured Alerts' },
  { id: 'triggered', label: 'Triggered Alerts' },
];

// Format duration in minutes to human-readable format
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Format timestamp to readable format
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get metric unit for display
const getMetricUnit = (metricName: string, service: 'VM' | 'LB'): string => {
  const metrics = service === 'VM' ? vmMetrics : lbMetrics;
  const metric = metrics.find(m => m.name === metricName);
  return metric ? metric.unit : '';
};

export default function AlertsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('configured');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [alerts, setAlerts] = useState<ConfiguredAlert[]>(mockConfiguredAlerts);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<ConfiguredAlert | null>(null);
  const { toast } = useToast();

  // Filter states for triggered alerts
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isDateSelecting, setIsDateSelecting] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('all');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handlePause = useCallback((alert: ConfiguredAlert) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(a =>
        a.id === alert.id
          ? {
              ...a,
              status: a.status === 'active' ? 'paused' : 'active',
            }
          : a
      )
    );
    toast({
      title: alert.status === 'active' ? 'Alert paused' : 'Alert resumed',
      description: `${alert.name} has been ${alert.status === 'active' ? 'paused' : 'resumed'}.`,
    });
  }, [toast]);

  const handleEdit = useCallback((alert: ConfiguredAlert) => {
    router.push(`/observability/alerts/configured/${alert.id}/edit`);
  }, [router]);

  const handleDeleteClick = useCallback((alert: ConfiguredAlert) => {
    setAlertToDelete(alert);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = () => {
    if (alertToDelete) {
      setAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alertToDelete.id));
      toast({
        title: 'Alert deleted',
        description: `${alertToDelete.name} has been deleted.`,
      });
      setDeleteModalOpen(false);
      setAlertToDelete(null);
    }
  };

  const columns: Column<ConfiguredAlert>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        searchable: true,
        render: (value: string, row: ConfiguredAlert) => (
          <a
            href={`/observability/alerts/configured/${row.id}`}
            className="text-primary font-medium hover:underline"
          >
            {value}
          </a>
        ),
      },
      {
        key: 'description',
        label: 'Description',
        sortable: true,
        searchable: true,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value: string) => <StatusBadge status={value} />,
      },
      {
        key: 'service',
        label: 'Service',
        sortable: true,
        render: (value: string) => (
          <div className="text-sm font-medium">{value}</div>
        ),
      },
      {
        key: 'metric',
        label: 'Metric',
        sortable: true,
        render: (value: string, row: ConfiguredAlert) => {
          const unit = getMetricUnit(value, row.service);
          return (
            <div className="text-sm">
              {value}
              {unit && <span className="text-muted-foreground ml-1">({unit})</span>}
            </div>
          );
        },
      },
      {
        key: 'condition',
        label: 'Condition & Threshold',
        sortable: false,
        render: (value: string, row: ConfiguredAlert) => {
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
        key: 'notificationEnabled',
        label: 'Notification Enabled',
        sortable: true,
        render: (value: boolean) => (
          <div className="text-sm">
            {value ? (
              <span className="text-green-600 font-medium">Yes</span>
            ) : (
              <span className="text-muted-foreground">No</span>
            )}
          </div>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        align: 'right',
        sortable: false,
        render: (_: any, row: ConfiguredAlert) => (
          <div className="flex justify-end">
            <ActionMenu
              resourceName={row.name}
              resourceType="Alert"
              viewHref={`/observability/alerts/configured/${row.id}`}
              viewLabel="View Details"
              customActions={[
                {
                  label: row.status === 'active' ? 'Pause' : 'Resume',
                  onClick: () => handlePause(row),
                  icon: <Pause className="mr-2 h-4 w-4" />,
                },
                {
                  label: 'Edit',
                  onClick: () => handleEdit(row),
                  icon: <Edit className="mr-2 h-4 w-4" />,
                },
              ]}
              onCustomDelete={() => handleDeleteClick(row)}
            />
          </div>
        ),
      },
    ],
    [handlePause, handleEdit, handleDeleteClick]
  );

  const triggeredColumns: Column<TriggeredAlert>[] = useMemo(
    () => [
      {
        key: 'triggeredTimestamp',
        label: 'Triggered Time',
        sortable: true,
        render: (value: string) => (
          <div className="text-sm">{formatTimestamp(value)}</div>
        ),
      },
      {
        key: 'alertName',
        label: 'Alert',
        sortable: true,
        searchable: true,
        render: (value: string) => (
          <div className="text-sm font-medium">{value}</div>
        ),
      },
      {
        key: 'resourceName',
        label: 'Resource Name',
        sortable: true,
        searchable: true,
        render: (value: string, row: TriggeredAlert) => (
          <div className="text-sm">
            <span className="font-medium">{value}</span>
            <span className="text-muted-foreground ml-2">({row.service})</span>
          </div>
        ),
      },
      {
        key: 'condition',
        label: 'Condition',
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
        label: 'Average Value',
        sortable: true,
        render: (value: number, row: TriggeredAlert) => {
          const unit = getMetricUnit(row.metric, row.service);
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-sm font-medium cursor-help">
                    {value.toFixed(1)}
                    {unit && <span className="text-muted-foreground ml-1">{unit}</span>}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  className="bg-black text-white border-black"
                  sideOffset={8}
                >
                  <p className="text-xs font-medium">
                    Peak Value: {row.peakValue.toFixed(1)}
                    {unit && ` ${unit}`}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        key: 'durationMinutes',
        label: 'Duration',
        sortable: true,
        render: (value: number) => (
          <div className="text-sm">{formatDuration(value)}</div>
        ),
      },
    ],
    []
  );

  const handleRefresh = () => {
    // In a real app, this would fetch fresh data
    console.log('Refreshing configured alerts...');
  };

  const handleTriggeredRefresh = () => {
    // In a real app, this would fetch fresh data
    console.log('Refreshing triggered alerts...');
  };

  // Get unique metrics from triggered alerts
  const uniqueMetrics = useMemo(() => {
    const metrics = Array.from(
      new Set(mockTriggeredAlerts.map(alert => alert.metric))
    );
    return metrics.sort();
  }, []);

  // Date range presets
  const datePresets = [
    {
      label: 'Last 7 days',
      range: { from: subDays(new Date(), 7), to: new Date() },
    },
    {
      label: 'Last 30 days',
      range: { from: subDays(new Date(), 30), to: new Date() },
    },
    {
      label: 'Last 3 months',
      range: { from: subMonths(new Date(), 3), to: new Date() },
    },
    {
      label: 'This month',
      range: {
        from: startOfMonth(new Date()),
        to: new Date(),
      },
    },
  ];

  const handlePresetSelect = (preset: (typeof datePresets)[0]) => {
    setDateRange(preset.range);
    setIsDatePickerOpen(false);
    setIsDateSelecting(false);
  };

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    setDateRange(selectedDate);
    if (selectedDate?.from && selectedDate?.to) {
      setIsDateSelecting(false);
    } else if (selectedDate?.from && !selectedDate?.to) {
      setIsDateSelecting(true);
    } else {
      setIsDateSelecting(false);
    }
  };

  // Filter triggered alerts based on date range and metric
  const filteredTriggeredAlerts = useMemo(() => {
    let filtered = [...mockTriggeredAlerts];

    // Filter by date range
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(alert => {
        const alertDate = new Date(alert.triggeredTimestamp);
        // Set time to start of day for from date and end of day for to date
        const fromDate = new Date(dateRange.from!);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(dateRange.to!);
        toDate.setHours(23, 59, 59, 999);
        return alertDate >= fromDate && alertDate <= toDate;
      });
    } else if (dateRange?.from) {
      filtered = filtered.filter(alert => {
        const alertDate = new Date(alert.triggeredTimestamp);
        const fromDate = new Date(dateRange.from!);
        fromDate.setHours(0, 0, 0, 0);
        return alertDate >= fromDate;
      });
    }

    // Filter by metric
    if (selectedMetric !== 'all') {
      filtered = filtered.filter(alert => alert.metric === selectedMetric);
    }

    return filtered;
  }, [dateRange, selectedMetric]);

  return (
    <>
      <PageShell
        title="Alerts"
        description="Manage and monitor system alerts"
        headerActions={
          <Button
            onClick={() => setCreateModalOpen(true)}
            className='bg-black text-white rounded-full px-6 py-2 text-base font-medium hover:bg-neutral-800'
          >
            Create Alert
          </Button>
        }
      >
        <div className="space-y-6">
          <VercelTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            size="lg"
          />

          {activeTab === 'configured' && (
            <ShadcnDataTable
              columns={columns}
              data={alerts}
              searchableColumns={['name', 'description']}
              defaultSort={{ column: 'name', direction: 'asc' }}
              pageSize={10}
              enableSearch={true}
              enablePagination={true}
              onRefresh={handleRefresh}
              searchPlaceholder="Search alerts by name or description..."
            />
          )}

          {activeTab === 'triggered' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Date Range Filter */}
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 min-w-[260px] justify-start text-left font-normal rounded-md"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, 'LLL dd, y')} -{' '}
                            {format(dateRange.to, 'LLL dd, y')}
                          </>
                        ) : (
                          <span className="text-blue-600">
                            From: {format(dateRange.from, 'LLL dd, y')} | Select end date
                          </span>
                        )
                      ) : (
                        <span>Select date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b">
                      <div className="space-y-1">
                        {datePresets.map((preset, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            className="w-full justify-start text-left text-sm h-8"
                            onClick={() => handlePresetSelect(preset)}
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={handleDateSelect}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>

                {/* Metric Filter */}
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="h-9 w-[200px] rounded-md">
                    <SelectValue placeholder="All Metrics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Metrics</SelectItem>
                    {uniqueMetrics.map(metric => (
                      <SelectItem key={metric} value={metric}>
                        {metric}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data Table */}
              <ShadcnDataTable
                columns={triggeredColumns}
                data={filteredTriggeredAlerts}
                searchableColumns={['alertName', 'resourceName']}
                defaultSort={{ column: 'triggeredTimestamp', direction: 'desc' }}
                pageSize={10}
                enableSearch={true}
                enablePagination={true}
                onRefresh={handleTriggeredRefresh}
                searchPlaceholder="Search by alert name or resource name..."
              />
            </div>
          )}
        </div>
      </PageShell>

      <CreateAlertModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {alertToDelete && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setAlertToDelete(null);
          }}
          resourceName={alertToDelete.name}
          resourceType="Alert"
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}

