'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { autoScalingGroups } from '@/lib/data';
import {
  Edit,
  Trash2,
  Activity,
  HardDrive,
  Zap,
  Users,
  TrendingUp,
} from 'lucide-react';
import { PageLayout } from '@/components/page-layout';
import { DetailGrid } from '@/components/detail-grid';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShadcnDataTable } from '@/components/ui/shadcn-data-table';
import { AutoScalingSettingsModal } from '@/components/modals/auto-scaling-settings-modal';

export default function AutoScalingGroupDetailsPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isScalingModalOpen, setIsScalingModalOpen] = useState(false);

  const asg = autoScalingGroups.find(a => a.id === id);

  if (!asg) {
    return (
      <div className='p-8 text-center text-gray-500'>
        Auto Scaling Group not found
      </div>
    );
  }

  // Format created date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // Breadcrumbs
  const customBreadcrumbs = [
    { href: '/dashboard', title: 'Home' },
    { href: '/compute', title: 'Compute' },
    { href: '/compute/auto-scaling', title: 'Auto Scaling' },
    { href: `/compute/auto-scaling/groups/${asg.id}`, title: asg.name },
  ];

  // Instance specifications from ASG data
  const instanceSpecifications = {
    name: asg.name,
    type: asg.type,
    instanceFlavour: asg.flavour,
    minCapacity: asg.minCapacity,
    desiredCapacity: asg.desiredCapacity,
    maxCapacity: asg.maxCapacity,
    sshKey: asg.sshKey || 'ssh-3',
    securityGroups: asg.securityGroups || 'sg-12345f789abcd2',
    bootableVolumeSize: asg.bootableVolumeSize || '20 GB',
    machineImage: asg.machineImage || 'Ubuntu 22.04 LTS'
  };

  const storageVolumes = [
    {
      type: 'Root Volume',
      name: 'Root Volume',
      size: '20 GB',
      volumeType: 'General Purpose SSD (gp3)'
    },
    {
      type: 'data-storage',
      name: 'data-storage', 
      size: '100 GB',
      volumeType: 'General Purpose SSD (gp3)'
    }
  ];

  const scalingPolicies = [
    {
      name: 'CPU Scale Out Policy',
      type: 'Average CPU Utilization',
      enabled: true,
      scaleUp: '70%',
      scaleDown: '30%',
      cooldown: '300s',
      scaleOutCooldown: '300s',
      scaleInCooldown: '300s'
    },
    {
      name: 'Memory Scale Out Policy',
      type: 'Average Memory Utilization',
      enabled: true,
      scaleUp: '80%',
      scaleDown: '40%',
      cooldown: '300s',
      scaleOutCooldown: '300s',
      scaleInCooldown: '300s'
    },
    {
      name: 'Nightly Scale Down',
      type: 'Scheduled Action',
      enabled: true,
      schedule: '0 22 * * *',
      nextRun: 'Today at 10:00 PM',
      action: 'Set desired capacity to 2',
      timezone: 'IST'
    }
  ];

  // Mock running instances
  const runningInstances = [
    {
      id: '1',
      name: 'media-processing-asg-01',
      status: 'running',
      privateIp: '54.218.123.47',
    },
    {
      id: '2',
      name: 'media-processing-asg-02',
      status: 'running',
      privateIp: '54.218.123.48',
    },
    {
      id: '3',
      name: 'media-processing-asg-03',
      status: 'terminating',
      privateIp: '54.218.123.49',
    },
    {
      id: '4',
      name: 'media-processing-asg-04',
      status: 'running',
      privateIp: '54.218.123.50',
    },
  ];

  // Instance table columns
  const instanceColumns = [
    {
      key: 'name',
      label: 'Instance Name',
      sortable: true,
      align: 'left',
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'left',
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: 'privateIp',
      label: 'Private IP Address',
      sortable: false,
      align: 'right',
      render: (value: string) => (
        <div className="text-right">{value}</div>
      ),
    },
  ];

  // Action handlers
  const handleEdit = () => {
    if (asg.status === "Creating") {
      toast({
        title: "Edit not available",
        description: "Cannot edit Auto Scaling Group while it's being created.",
        variant: "destructive",
      })
      return
    }
    window.location.href = `/compute/auto-scaling/groups/${asg.id}/edit`;
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    toast({
      title: "Auto Scaling Group deleted",
      description: `${asg.name} has been deleted successfully.`,
    });
    setIsDeleteModalOpen(false);
    // In a real app, you would navigate back to the listing page
    // window.location.href = '/compute/auto-scaling';
  };

  const handlePause = () => {
    toast({
      title: 'Auto Scaling Group paused',
      description: `${asg.name} has been paused.`,
    });
  };

  const handleStart = () => {
    toast({
      title: 'Auto Scaling Group started',
      description: `${asg.name} has been started.`,
    });
  };

  const handleAutoScalingSettings = () => {
    setIsScalingModalOpen(true);
  };

  const handleSettings = () => {
    toast({
      title: 'Settings',
      description: `Opening settings for ${asg.name}...`,
    });
  };


  return (
    <PageLayout
      title={asg.name}
      customBreadcrumbs={customBreadcrumbs}
      hideViewDocs={true}
    >
      <div className='space-y-8'>
        {/* ASG Basic Information */}
        <div
          className='mb-6 group relative'
          style={{
            borderRadius: '16px',
            border: '4px solid #FFF',
            background: 'linear-gradient(265deg, #FFF -13.17%, #F7F8FD 133.78%)',
            boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)',
            padding: '1.5rem',
          }}
        >
          {/* Overlay Action Buttons */}
          <div className='absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10'>
            <TooltipProvider>
              {asg.status !== 'Creating' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleAutoScalingSettings}
                      className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
                    >
                      <TrendingUp className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Auto Scaling Settings</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {asg.status !== 'Creating' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleEdit}
                      className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit Auto Scaling Group</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleDelete}
                    className='h-8 w-8 p-0 text-muted-foreground hover:text-red-600 bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Auto Scaling Group</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <DetailGrid>
            {/* ASG Name, Type, Status, Created On in one row */}
            <div className='col-span-full grid grid-cols-4 gap-4'>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  ASG Name
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {asg.name}
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Type
                </label>
                <div>
                  <Badge variant='secondary'>{asg.type}</Badge>
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Status
                </label>
                <div>
                  <StatusBadge status={asg.status} />
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Created On
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {formatDate(asg.createdOn)}
                </div>
              </div>
            </div>
          </DetailGrid>
        </div>

        {/* Network Configuration */}
        <div className='bg-card text-card-foreground border-border border rounded-lg'>
          <div className='p-6 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <h3 className='text-lg font-semibold'>Network Configuration</h3>
              </div>
            </div>
          </div>
          <div className='px-6 pb-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              <div className='space-y-1'>
                <Label className='text-xs text-muted-foreground'>Region</Label>
                <div className='text-sm font-medium'>{asg.region || 'US East N. Virginia'}</div>
              </div>
              <div className='space-y-1'>
                <Label className='text-xs text-muted-foreground'>VPC</Label>
                <div className='text-sm font-medium'>{asg.vpc}</div>
              </div>
              <div className='space-y-1'>
                <Label className='text-xs text-muted-foreground'>Subnet</Label>
                <div className='text-sm font-medium'>{asg.subnet || 'subnet-5'}</div>
              </div>
              <div className='space-y-1'>
                <Label className='text-xs text-muted-foreground'>Security Groups</Label>
                <div className='text-sm font-medium'>{instanceSpecifications.securityGroups}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Instance Configuration */}
        <div className='bg-card text-card-foreground border-border border rounded-lg'>
          <div className='p-6 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <h3 className='text-lg font-semibold'>Instance Configuration</h3>
              </div>
            </div>
          </div>
          <div className='px-6 pb-6'>
            <div className='space-y-6'>
              {/* Instance Details */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>Instance Name</Label>
                  <div className='text-sm font-medium'>{instanceSpecifications.name}-instance</div>
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>Instance Type</Label>
                  <div className='text-sm font-medium'>{instanceSpecifications.instanceFlavour}</div>
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>Machine Image</Label>
                  <div className='text-sm font-medium'>{instanceSpecifications.machineImage}</div>
                </div>
              </div>

              {/* Instance Scaling */}
              <div>
                <Label className='text-sm font-medium mb-3 block'>Instance Scaling</Label>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='space-y-1'>
                    <Label className='text-xs text-muted-foreground'>Minimum Instances</Label>
                    <div className='text-sm font-medium'>{instanceSpecifications.minCapacity}</div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs text-muted-foreground'>Desired Instances</Label>
                    <div className='text-sm font-medium'>{instanceSpecifications.desiredCapacity}</div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs text-muted-foreground'>Maximum Instances</Label>
                    <div className='text-sm font-medium'>{instanceSpecifications.maxCapacity}</div>
                  </div>
                </div>
              </div>

              {/* Storage Configuration */}
              <div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  <div className='space-y-1'>
                    <Label className='text-xs text-muted-foreground'>Bootable Volume Name</Label>
                    <div className='text-sm font-medium'>{instanceSpecifications.name}-boot</div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs text-muted-foreground'>Bootable Volume Size</Label>
                    <div className='text-sm font-medium'>{instanceSpecifications.bootableVolumeSize}</div>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4'>
                  <div className='space-y-1'>
                    <Label className='text-xs text-muted-foreground'>Storage Volumes</Label>
                    <div className='text-sm font-medium'>{storageVolumes.length} volume(s) configured</div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs text-muted-foreground'>SSH Key</Label>
                    <div className='text-sm font-medium'>{instanceSpecifications.sshKey}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto Scaling Policies */}
        <div className='bg-card text-card-foreground border-border border rounded-lg'>
          <div className='p-6 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <h3 className='text-lg font-semibold'>Auto Scaling Policies</h3>
                <div className='bg-gray-800 text-white text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center'>
                  {scalingPolicies.length}
                </div>
              </div>
            </div>
          </div>
          <div className='px-6 pb-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {scalingPolicies.map((policy, index) => (
              <div
                key={index}
                className='border transition-colors rounded-lg bg-card p-4 relative border-border hover:border-gray-300'
              >
                {/* Fields */}
                <div className='space-y-3 text-xs'>
                      {/* Policy Type */}
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Policy Type
                        </Label>
                        <div className='mt-1'>
                          <span className='text-sm'>{policy.type}</span>
                        </div>
                      </div>

                  {(policy.type === 'Average CPU Utilization' || policy.type === 'Average Memory Utilization') && (
                    <div className='space-y-3'>
                      <div className='grid grid-cols-2 gap-6'>
                        <div>
                          <Label className='text-xs text-muted-foreground'>
                            Up Scale Target
                          </Label>
                          <div className='mt-1'>
                            <span className='text-sm'>{policy.scaleUp}</span>
                          </div>
                        </div>
                        <div>
                          <Label className='text-xs text-muted-foreground'>
                            Down Scale Target
                          </Label>
                          <div className='mt-1'>
                            <span className='text-sm'>{policy.scaleDown}</span>
                          </div>
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-6'>
                        <div>
                          <Label className='text-xs text-muted-foreground'>
                            Scale Out Cooldown
                          </Label>
                          <div className='mt-1'>
                            <span className='text-sm'>{policy.scaleOutCooldown}</span>
                          </div>
                        </div>
                        <div>
                          <Label className='text-xs text-muted-foreground'>
                            Scale In Cooldown
                          </Label>
                          <div className='mt-1'>
                            <span className='text-sm'>{policy.scaleInCooldown}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {policy.type === 'Scheduled Action' && (
                    <div className='space-y-3'>
                      <div className='grid grid-cols-1 gap-6'>
                        <div>
                          <Label className='text-xs text-muted-foreground'>
                            Timezone
                          </Label>
                          <div className='mt-1'>
                            <span className='text-sm'>{policy.timezone || 'IST (Indian Standard Time)'}</span>
                          </div>
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-6'>
                        <div>
                          <Label className='text-xs text-muted-foreground'>
                            Scale Up Time
                          </Label>
                          <div className='mt-1'>
                            <span className='text-sm'>
                              {String(policy.scaleUpHours || 9).padStart(2, '0')}:
                              {String(policy.scaleUpMinutes || 0).padStart(2, '0')}:
                              {String(policy.scaleUpSeconds || 0).padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                        <div>
                          <Label className='text-xs text-muted-foreground'>
                            Scale Down Time
                          </Label>
                          <div className='mt-1'>
                            <span className='text-sm'>
                              {String(policy.scaleDownHours || 18).padStart(2, '0')}:
                              {String(policy.scaleDownMinutes || 0).padStart(2, '0')}:
                              {String(policy.scaleDownSeconds || 0).padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Instance Details */}
        <div className='bg-card text-card-foreground border-border border rounded-lg p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <h3 className='text-lg font-semibold'>Instance Details</h3>
              <div className='bg-gray-800 text-white text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center'>
                {runningInstances.length}
              </div>
            </div>
          </div>
          <ShadcnDataTable
            columns={instanceColumns}
            data={runningInstances}
            searchableColumns={[]}
            pageSize={10}
            enableSearch={false}
            enableColumnVisibility={false}
            enablePagination={true}
            enableVpcFilter={false}
          />
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        resourceName={asg.name}
        resourceType="Auto Scaling Group"
        onConfirm={handleDeleteConfirm}
      />

      {/* Auto Scaling Settings Modal */}
      <AutoScalingSettingsModal
        isOpen={isScalingModalOpen}
        onClose={() => setIsScalingModalOpen(false)}
        asgName={asg.name}
        currentVMs={asg.desiredCapacity}
        minCapacity={asg.minCapacity}
        maxCapacity={asg.maxCapacity}
        desiredCapacity={asg.desiredCapacity}
      />
    </PageLayout>
  );
}
