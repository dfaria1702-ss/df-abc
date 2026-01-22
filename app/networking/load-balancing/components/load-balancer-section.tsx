'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/status-badge';
import { loadBalancers } from '@/lib/data';
import { ActionMenu } from '@/components/action-menu';
import { ShadcnDataTable } from '@/components/ui/shadcn-data-table';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { useToast } from '@/hooks/use-toast';
import {
  filterDataForUser,
  shouldShowEmptyState,
  getEmptyStateMessage,
} from '@/lib/demo-data-filter';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import {
  HealthIndicator,
  calculateOverallHealth,
} from '@/components/ui/health-indicator';

export default function LoadBalancerSection() {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLoadBalancer, setSelectedLoadBalancer] = useState<any>(null);

  // Filter data based on user type for demo
  const filteredLoadBalancers = filterDataForUser(loadBalancers);
  const showEmptyState =
    shouldShowEmptyState() && filteredLoadBalancers.length === 0;

  const loadBalancerIcon = (
    <svg
      width='300'
      height='200'
      viewBox='0 0 300 200'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-72'
    >
      <rect width='300' height='200' fill='white' />

      {/* Load Balancer central icon */}
      <rect
        x='125'
        y='75'
        width='50'
        height='50'
        rx='8'
        fill='#4CAF50'
        stroke='#2E7D32'
        strokeWidth='2'
      />
      <text
        x='150'
        y='95'
        textAnchor='middle'
        fill='white'
        fontSize='10'
        fontWeight='bold'
      >
        LB
      </text>
      <text x='150' y='107' textAnchor='middle' fill='white' fontSize='8'>
        ALB
      </text>

      {/* Incoming traffic from top */}
      <circle cx='150' cy='30' r='8' fill='#2196F3' />
      <text
        x='150'
        y='35'
        textAnchor='middle'
        fill='white'
        fontSize='10'
        fontWeight='bold'
      >
        ↓
      </text>
      <line
        x1='150'
        y1='45'
        x2='150'
        y2='75'
        stroke='#666'
        strokeWidth='2'
        markerEnd='url(#arrowhead)'
      />

      {/* Target instances */}
      <rect
        x='60'
        y='140'
        width='35'
        height='25'
        rx='4'
        fill='#E3F2FD'
        stroke='#1976D2'
        strokeWidth='1'
      />
      <text x='77.5' y='155' textAnchor='middle' fill='#1976D2' fontSize='8'>
        VM1
      </text>

      <rect
        x='110'
        y='140'
        width='35'
        height='25'
        rx='4'
        fill='#E3F2FD'
        stroke='#1976D2'
        strokeWidth='1'
      />
      <text x='127.5' y='155' textAnchor='middle' fill='#1976D2' fontSize='8'>
        VM2
      </text>

      <rect
        x='155'
        y='140'
        width='35'
        height='25'
        rx='4'
        fill='#E3F2FD'
        stroke='#1976D2'
        strokeWidth='1'
      />
      <text x='172.5' y='155' textAnchor='middle' fill='#1976D2' fontSize='8'>
        VM3
      </text>

      <rect
        x='205'
        y='140'
        width='35'
        height='25'
        rx='4'
        fill='#E3F2FD'
        stroke='#1976D2'
        strokeWidth='1'
      />
      <text x='222.5' y='155' textAnchor='middle' fill='#1976D2' fontSize='8'>
        VM4
      </text>

      {/* Connection lines from LB to targets */}
      <line
        x1='135'
        y1='125'
        x2='77.5'
        y2='140'
        stroke='#666'
        strokeWidth='1.5'
      />
      <line
        x1='145'
        y1='125'
        x2='127.5'
        y2='140'
        stroke='#666'
        strokeWidth='1.5'
      />
      <line
        x1='155'
        y1='125'
        x2='172.5'
        y2='140'
        stroke='#666'
        strokeWidth='1.5'
      />
      <line
        x1='165'
        y1='125'
        x2='222.5'
        y2='140'
        stroke='#666'
        strokeWidth='1.5'
      />

      {/* Health check indicators */}
      <circle cx='67' cy='132' r='3' fill='#4CAF50' />
      <circle cx='117' cy='132' r='3' fill='#4CAF50' />
      <circle cx='162' cy='132' r='3' fill='#4CAF50' />
      <circle cx='212' cy='132' r='3' fill='#FF9800' />

      {/* Arrow marker definition */}
      <defs>
        <marker
          id='arrowhead'
          markerWidth='10'
          markerHeight='7'
          refX='9'
          refY='3.5'
          orient='auto'
        >
          <polygon points='0 0, 10 3.5, 0 7' fill='#666' />
        </marker>
      </defs>

      {/* Background grid */}
      <defs>
        <pattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'>
          <path
            d='M 20 0 L 0 0 0 20'
            fill='none'
            stroke='#f0f0f0'
            strokeWidth='1'
          />
        </pattern>
      </defs>
      <rect width='300' height='200' fill='url(#grid)' opacity='0.3' />
    </svg>
  );

  const handleDeleteClick = (loadBalancer: any) => {
    setSelectedLoadBalancer(loadBalancer);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLoadBalancer) {
      return;
    }

    // In a real app, this would delete the load balancer via API
    console.log('Deleting Load Balancer:', selectedLoadBalancer.name);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Show success toast
    toast({
      title: 'Load balancer deleted successfully',
      description: `Load Balancer "${selectedLoadBalancer.name}" deleted successfully`,
    });

    // Close modal and clear selection
    setIsDeleteModalOpen(false);
    setSelectedLoadBalancer(null);

    // In a real app, you would refresh the data here
    // For now, we'll just reload the page
    window.location.reload();
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      searchable: true,
      render: (value: string, row: any) => (
        <a
          href={`/networking/load-balancing/balancer/${row.id}`}
          className='text-primary font-medium hover:underline leading-5'
        >
          {value}
        </a>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      searchable: true,
      render: (value: string) => (
        <div className='leading-5 capitalize'>{value}</div>
      ),
    },
    {
      key: 'operatingStatus',
      label: 'Operating Status',
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: 'targetGroupHealth',
      label: 'Target Group Health',
      render: (value: string, row: any) => {
        const targetGroups = row.targetGroupsDetails || [];

        // Handle no target groups case
        if (targetGroups.length === 0) {
          return (
            <div className='flex items-center gap-2'>
              <HealthIndicator status='no-targets' size='sm' />
              <span className='text-muted-foreground leading-5'>
                0 Target Groups
              </span>
            </div>
          );
        }

        // Calculate overall health status
        const overallHealth = calculateOverallHealth(
          targetGroups,
          row.operatingStatus
        );
        const totalCount = targetGroups.length;
        const displayGroups = targetGroups.slice(0, 3);
        const hasMore = totalCount > 3;

        return (
          <div className='relative group'>
            <div className='flex items-center gap-2'>
              <HealthIndicator status={overallHealth} size='sm' />
              <span className='cursor-help leading-5 font-medium'>
                {totalCount} Target Group{totalCount !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Hover Tooltip */}
            <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 min-w-max'>
              <div className='space-y-1'>
                {displayGroups.map((tg: any) => {
                  // If operating status is inactive, show as not healthy
                  const isInactive = row.operatingStatus === 'inactive';
                  const healthText = isInactive
                    ? 'Not healthy (LB inactive)'
                    : tg.totalTargets === 0
                      ? 'No targets'
                      : `${tg.healthyTargets}/${tg.totalTargets} targets healthy`;

                  return (
                    <div
                      key={tg.id}
                      className='flex items-center justify-between gap-4 text-xs'
                    >
                      <span className='font-medium'>{tg.name}</span>
                      <span className='whitespace-nowrap'>{healthText}</span>
                    </div>
                  );
                })}
                {hasMore && (
                  <div className='text-xs text-gray-300 mt-2'>
                    +{totalCount - 3} more
                  </div>
                )}
              </div>
              {/* Arrow pointing down */}
              <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black'></div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'ipAddresses',
      label: 'IP Addresses',
      render: (value: any, row: any) => (
        <div className='leading-5 space-y-1'>
          {row.fixedIP && (
            <div className='text-sm'>
              <span className='text-muted-foreground'>Fixed IP: </span>
              <span>{row.fixedIP}</span>
            </div>
          )}
          {row.publicIP && (
            <div className='text-sm'>
              <span className='text-muted-foreground'>Public IP: </span>
              <span>{row.publicIP}</span>
            </div>
          )}
          {!row.fixedIP && !row.publicIP && (
            <span className='text-muted-foreground text-sm'>—</span>
          )}
        </div>
      ),
    },
    {
      key: 'createdOn',
      label: 'Created On',
      sortable: true,
      render: (value: string) => {
        const date = new Date(value);
        return (
          <div className='text-muted-foreground leading-5'>
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right' as const,
      render: (_: any, row: any) => {
        // Build metrics URL with resource name, 6 hours time range, and 1 min granularity
        const metricsHref = `/observability/metrics/lb?resource=${encodeURIComponent(row.name)}&timeRange=6&granularity=1`;
        
        return (
          <div className='flex justify-end'>
            <ActionMenu
              viewHref={`/networking/load-balancing/balancer/${row.id}`}
              editHref={`/networking/load-balancing/balancer/${row.id}/edit`}
              onCustomDelete={() => handleDeleteClick(row)}
              resourceName={row.name}
              resourceType='Load Balancer'
              metricsHref={metricsHref}
            />
          </div>
        );
      },
    },
  ];

  // Add actions property to each load balancer row for DataTable
  const dataWithActions = filteredLoadBalancers.map(lb => ({
    ...lb,
    actions: null,
  }));

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div>
      {showEmptyState ? (
        <Card className='mt-8'>
          <CardContent>
            <EmptyState
              {...getEmptyStateMessage('load-balancer')}
              icon={loadBalancerIcon}
              onAction={() =>
                (window.location.href =
                  '/networking/load-balancing/balancer/create')
              }
            />
          </CardContent>
        </Card>
      ) : (
        <ShadcnDataTable
          columns={columns}
          data={dataWithActions}
          searchableColumns={['name', 'type']}
          pageSize={10}
          enableSearch={true}
          enableColumnVisibility={false}
          enablePagination={true}
          onRefresh={handleRefresh}
          enableVpcFilter={true}
          vpcOptions={[
            { value: 'all', label: 'All VPCs' },
            { value: 'production-vpc', label: 'production-vpc' },
            { value: 'development-vpc', label: 'development-vpc' },
            { value: 'staging-vpc', label: 'staging-vpc' },
          ]}
          searchPlaceholder='Search LB name...'
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedLoadBalancer(null);
        }}
        resourceName={selectedLoadBalancer?.name || ''}
        resourceType='Load Balancer'
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
