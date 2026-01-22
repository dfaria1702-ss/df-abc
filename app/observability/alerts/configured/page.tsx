'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { CreateAlertModal } from '@/components/modals/create-alert-modal';
import { ShadcnDataTable, Column } from '@/components/ui/shadcn-data-table';
import { StatusBadge } from '@/components/status-badge';
import { ActionMenu } from '@/components/action-menu';
import {
  mockConfiguredAlerts,
  formatConditionOperator,
  ConfiguredAlert,
  vmMetrics,
  lbMetrics,
} from '@/lib/observability-data';

export default function ConfiguredAlertsPage() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleEdit = useCallback((alert: ConfiguredAlert) => {
    router.push(`/observability/alerts/configured/${alert.id}/edit`);
  }, [router]);

  // Get metric unit for display
  const getMetricUnit = (metricName: string, service: 'VM' | 'LB'): string => {
    const metrics = service === 'VM' ? vmMetrics : lbMetrics;
    const metric = metrics.find(m => m.name === metricName);
    return metric ? metric.unit : '';
  };

  const columns: Column<ConfiguredAlert>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        searchable: true,
        render: (value: string, row: ConfiguredAlert) => (
          <Link
            href={`/observability/alerts/configured/${row.id}`}
            className="text-primary font-medium hover:underline"
          >
            {value}
          </Link>
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
              onEdit={() => handleEdit(row)}
            />
          </div>
        ),
      },
    ],
    [handleEdit]
  );

  const handleRefresh = () => {
    // In a real app, this would fetch fresh data
    console.log('Refreshing configured alerts...');
  };

  return (
    <>
      <PageShell
        title="Configured Alerts"
        description="View and manage configured alert rules"
        headerActions={
          <Button
            onClick={() => setCreateModalOpen(true)}
            className='bg-black text-white rounded-full px-6 py-2 text-base font-medium hover:bg-neutral-800'
          >
            Create Alert
          </Button>
        }
      >
        <ShadcnDataTable
          columns={columns}
          data={mockConfiguredAlerts}
          searchableColumns={['name', 'description']}
          defaultSort={{ column: 'name', direction: 'asc' }}
          pageSize={10}
          enableSearch={true}
          enablePagination={true}
          onRefresh={handleRefresh}
          searchPlaceholder="Search alerts by name or description..."
        />
      </PageShell>

      <CreateAlertModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  );
}

