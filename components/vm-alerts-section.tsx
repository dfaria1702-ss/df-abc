'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CreateAlertModal } from '@/components/modals/create-alert-modal';
import { AlertHistoryModal } from '@/components/modals/alert-history-modal';
import { ShadcnDataTable, Column } from '@/components/ui/shadcn-data-table';
import { StatusBadge } from '@/components/status-badge';
import { ActionMenu } from '@/components/action-menu';
import {
  mockConfiguredAlerts,
  formatConditionOperator,
  ConfiguredAlert,
  vmMetrics,
} from '@/lib/observability-data';

interface VMAlertsSectionProps {
  vmName: string;
  vmId?: string;
}

export function VMAlertsSection({ vmName, vmId }: VMAlertsSectionProps) {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [alertHistoryModalOpen, setAlertHistoryModalOpen] = useState(false);
  
  // Generate KRN ID from VM ID (format: krn:vm:region:account:vm/{vmId})
  // For now, using a simplified format
  const vmKrnId = vmId ? `krn:vm:us-east-1:123456789:vm/${vmId}` : '';

  // Filter alerts to show only VM alerts
  const vmAlerts = useMemo(() => {
    return mockConfiguredAlerts.filter(alert => alert.service === 'VM');
  }, []);

  const handleEdit = useCallback((alert: ConfiguredAlert) => {
    router.push(`/observability/alerts/configured/${alert.id}/edit`);
  }, [router]);

  // Get metric unit for display
  const getMetricUnit = (metricName: string): string => {
    const metric = vmMetrics.find(m => m.name === metricName);
    return metric ? metric.unit : '';
  };

  const columns: Column<ConfiguredAlert>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        searchable: true,
        render: (value: string) => (
          <span className="text-primary font-medium">{value}</span>
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
          const unit = getMetricUnit(value);
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
          const unit = getMetricUnit(row.metric);
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
    console.log('Refreshing VM alerts...');
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => setAlertHistoryModalOpen(true)}
            variant="outline"
            className='rounded-full px-6 py-2 text-base font-medium'
          >
            Alert History
          </Button>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className='bg-black text-white rounded-full px-6 py-2 text-base font-medium hover:bg-neutral-800'
          >
            Create Alert
          </Button>
        </div>
        <ShadcnDataTable
          columns={columns}
          data={vmAlerts}
          searchableColumns={['name', 'description']}
          defaultSort={{ column: 'name', direction: 'asc' }}
          pageSize={10}
          enableSearch={true}
          enablePagination={true}
          onRefresh={handleRefresh}
          searchPlaceholder="Search alerts by name or description..."
        />
      </div>

      <CreateAlertModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        vmName={vmName}
        vmKrnId={vmKrnId}
      />

      <AlertHistoryModal
        open={alertHistoryModalOpen}
        onClose={() => setAlertHistoryModalOpen(false)}
        vmName={vmName}
      />
    </>
  );
}

