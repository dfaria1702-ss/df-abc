'use client';

import { use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { ShadcnDataTable, Column } from '@/components/ui/shadcn-data-table';
import { EmptyState } from '@/components/ui/empty-state';
import {
  mockConfiguredAlerts,
  mockTriggeredAlerts,
  getTriggeredAlertsForAlert,
  formatConditionOperator,
  vmMetrics,
  lbMetrics,
  TriggeredAlert,
} from '@/lib/observability-data';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

export default function AlertDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const alert = useMemo(() => {
    return mockConfiguredAlerts.find(a => a.id === id);
  }, [id]);

  if (!alert) {
    notFound();
  }

  // Get triggered alerts for this alert from the last 15 days
  const triggeredAlerts = useMemo(() => {
    return getTriggeredAlertsForAlert(alert.id, 15);
  }, [alert.id]);

  const unit = getMetricUnit(alert.metric, alert.service);
  const operator = formatConditionOperator(alert.condition);

  // Format last triggered timestamp
  const formatLastTriggered = (timestamp?: string): string => {
    if (!timestamp) return 'Never';
    return formatTimestamp(timestamp);
  };

  // Triggered alerts table columns (same as triggered alerts page)
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

  const customBreadcrumbs = [
    { href: '/dashboard', title: 'Home' },
    { href: '/observability', title: 'Observability' },
    { href: '/observability/alerts', title: 'Alerts' },
    { href: '/observability/alerts/configured', title: 'Configured Alerts' },
    { title: alert.name },
  ];

  const headerActions = (
    <Button
      variant="outline"
      onClick={() => router.push(`/observability/alerts/configured/${id}/edit`)}
      className="rounded-full"
    >
      <Edit className="mr-2 h-4 w-4" />
      Edit
    </Button>
  );

  return (
    <PageLayout
      title={alert.name}
      description={alert.description}
      customBreadcrumbs={customBreadcrumbs}
      headerActions={headerActions}
      hideViewDocs={true}
    >
      <div className="space-y-6">
        {/* First Section: Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Name
                </div>
                <div className="text-base font-medium">{alert.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Status
                </div>
                <div>
                  <StatusBadge status={alert.status} />
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Description
                </div>
                <div className="text-base">{alert.description}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Metric
                </div>
                <div className="text-base">
                  {alert.metric}
                  {unit && (
                    <span className="text-muted-foreground ml-1">({unit})</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Condition
                </div>
                <div className="text-base font-medium">
                  {operator} {alert.thresholdValue}
                  {unit && (
                    <span className="text-muted-foreground ml-1">{unit}</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Last Triggered At
                </div>
                <div className="text-base">
                  {formatLastTriggered(alert.lastTriggeredAt)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Second Section: Notification Information */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Notification Enabled
                </div>
                <div className="text-base">
                  {alert.notificationEnabled ? (
                    <span className="text-green-600 font-medium">Yes</span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )}
                </div>
              </div>
              {alert.notificationEnabled && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Notification Emails
                  </div>
                  {alert.notificationEmails && alert.notificationEmails.length > 0 ? (
                    <div className="space-y-1">
                      {alert.notificationEmails.map((email, index) => (
                        <div key={index} className="text-base">
                          {email}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-base text-muted-foreground">
                      No email addresses configured
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Third Section: Trigger History (Last 15 Days) */}
        <Card>
          <CardHeader>
            <CardTitle>Trigger History (Last 15 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {triggeredAlerts.length > 0 ? (
              <ShadcnDataTable
                columns={triggeredColumns}
                data={triggeredAlerts}
                searchableColumns={['resourceName']}
                defaultSort={{ column: 'triggeredTimestamp', direction: 'desc' }}
                pageSize={10}
                enableSearch={true}
                enablePagination={true}
                searchPlaceholder="Search by resource name..."
              />
            ) : (
              <EmptyState
                title="No triggers found"
                description={`This alert has not been triggered in the last 15 days.`}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

