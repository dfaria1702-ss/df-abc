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
} from 'lucide-react';
import { PageLayout } from '@/components/page-layout';
import { DetailGrid } from '@/components/detail-grid';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AutoScalingGroupDetailsPage() {
  const { id } = useParams();
  const { toast } = useToast();

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
      name: 'CPU Utilization',
      type: 'CPU Utilization',
      enabled: true,
      scaleUp: '65%',
      scaleDown: '35%',
      cooldown: '300s'
    },
    {
      name: 'Nightly Scale Down',
      type: 'Scheduled Action',
      enabled: true,
      schedule: '0 22 * * *',
      nextRun: 'now',
      action: 'Set desired capacity to 3'
    }
  ];

  // Mock running instances
  const runningInstances = [
    // Empty state as shown in screenshot
  ];

  // Action handlers
  const handleEdit = () => {
    toast({
      title: 'Edit Auto Scaling Group',
      description: `Editing ${asg.name}...`,
    });
  };

  const handleDelete = () => {
    toast({
      title: 'Delete Auto Scaling Group',
      description: `Deleting ${asg.name}...`,
    });
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
          {/* Overlay Edit/Delete Buttons */}
          {asg.status !== 'Failed' && (
            <div className='absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10'>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleEdit}
                className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
              >
                <Edit className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleDelete}
                className='h-8 w-8 p-0 text-muted-foreground hover:text-red-600 bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          )}

          <DetailGrid>
            {/* ASG Name, Type, Flavour, Status in one row */}
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
                  Flavour
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {asg.flavour}
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
            </div>

            {/* VPC, Region, Subnet, Created On in second row */}
            <div className='col-span-full grid grid-cols-4 gap-4 mt-4'>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  VPC
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {asg.vpc}
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Region
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {asg.region || 'US East N. Virginia'}
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Subnet
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {asg.subnet || 'subnet-5'}
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

        {/* Instance Specifications */}
        <div className='bg-card text-card-foreground border-border border rounded-lg'>
          <div className='p-6 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <h3 className='text-lg font-semibold'>Instance Specifications</h3>
              </div>
            </div>
          </div>
          <div className='px-6 pb-6'>
            <div
              className='border transition-colors rounded-lg bg-card p-4 relative border-border hover:border-gray-300'
            >
              {/* Header with ASG name and CPU tag */}
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-2 flex-1 min-w-0'>
                  <h4 className='text-sm font-medium leading-none'>
                    {instanceSpecifications.name}
                  </h4>
                  <Badge variant='secondary' className='text-xs h-5'>
                    {instanceSpecifications.type}
                  </Badge>
                </div>
              </div>

              {/* Fields in specified order */}
              <div className='space-y-3 text-xs'>
                {/* Instance flavour */}
                <div>
                  <Label className='text-xs text-muted-foreground'>
                    Instance Flavour
                  </Label>
                  <div className='mt-1'>
                    <span className='text-sm'>
                      {instanceSpecifications.instanceFlavour} (0 vCPUs, 0 GB RAM)
                    </span>
                  </div>
                </div>

                {/* Min, Desired, Max Capacity in same row */}
                <div className='grid grid-cols-3 gap-6'>
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      Min Capacity
                    </Label>
                    <div className='mt-1'>
                      <span className='text-sm font-medium'>
                        {instanceSpecifications.minCapacity}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      Desired Capacity
                    </Label>
                    <div className='mt-1'>
                      <span className='text-sm font-medium'>
                        {instanceSpecifications.desiredCapacity}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      Max Capacity
                    </Label>
                    <div className='mt-1'>
                      <span className='text-sm font-medium'>
                        {instanceSpecifications.maxCapacity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SSH Key, Security Groups, and empty third column to align with capacity grid */}
                <div className='grid grid-cols-3 gap-6'>
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      SSH Key
                    </Label>
                    <div className='mt-1'>
                      <span className='text-sm'>{instanceSpecifications.sshKey}</span>
                    </div>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      Security Groups
                    </Label>
                    <div className='mt-1'>
                      <span className='text-sm'>{instanceSpecifications.securityGroups}</span>
                    </div>
                  </div>
                  <div></div>
                </div>

                {/* Bootable Volume Size, Machine Image, and empty third column */}
                <div className='grid grid-cols-3 gap-6'>
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      Bootable Volume Size
                    </Label>
                    <div className='mt-1'>
                      <span className='text-sm'>{instanceSpecifications.bootableVolumeSize}</span>
                    </div>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      Machine Image
                    </Label>
                    <div className='mt-1'>
                      <span className='text-sm'>{instanceSpecifications.machineImage}</span>
                    </div>
                  </div>
                  <div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Volumes */}
        <div className='bg-card text-card-foreground border-border border rounded-lg'>
          <div className='p-6 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <h3 className='text-lg font-semibold'>Storage Volumes</h3>
                <div className='bg-gray-800 text-white text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center'>
                  {storageVolumes.length}
                </div>
              </div>
            </div>
          </div>
          <div className='px-6 pb-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {storageVolumes.map((volume, index) => (
              <div
                key={index}
                className='border transition-colors rounded-lg bg-card p-4 relative border-border hover:border-gray-300'
              >
                {/* Header with volume name */}
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-sm font-medium leading-none'>
                      {volume.name}
                    </h4>
                  </div>
                </div>

                {/* Fields */}
                <div className='space-y-3 text-xs'>
                  <div className='grid grid-cols-2 gap-6'>
                    <div>
                      <Label className='text-xs text-muted-foreground'>
                        Size
                      </Label>
                      <div className='mt-1'>
                        <span className='text-sm'>{volume.size}</span>
                      </div>
                    </div>
                    <div>
                      <Label className='text-xs text-muted-foreground'>
                        Type
                      </Label>
                      <div className='mt-1'>
                        <span className='text-sm'>{volume.volumeType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Scaling Policies */}
        <div className='bg-card text-card-foreground border-border border rounded-lg'>
          <div className='p-6 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <h3 className='text-lg font-semibold'>Scaling Policies</h3>
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
                {/* Header with policy name and Active tag */}
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center gap-2 flex-1 min-w-0'>
                    <h4 className='text-sm font-medium leading-none'>
                      {policy.name}
                    </h4>
                    <Badge 
                      variant='secondary'
                      className={`text-xs h-5 cursor-default ${
                        policy.enabled
                          ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800'
                          : 'hover:bg-secondary hover:text-secondary-foreground'
                      }`}
                    >
                      {policy.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                {/* Fields */}
                <div className='space-y-3 text-xs'>
                  {/* Policy Type */}
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      Type
                    </Label>
                    <div className='mt-1'>
                      <span className='text-sm'>{policy.type}</span>
                    </div>
                  </div>

                  {policy.type === 'CPU Utilization' && (
                    <div className='grid grid-cols-3 gap-6'>
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Scale Up
                        </Label>
                        <div className='mt-1'>
                          <span className='text-sm'>{policy.scaleUp}</span>
                        </div>
                      </div>
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Scale Down
                        </Label>
                        <div className='mt-1'>
                          <span className='text-sm'>{policy.scaleDown}</span>
                        </div>
                      </div>
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Cooldown
                        </Label>
                        <div className='mt-1'>
                          <span className='text-sm'>{policy.cooldown}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {policy.type === 'Scheduled Action' && (
                    <div className='grid grid-cols-3 gap-6'>
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Schedule
                        </Label>
                        <div className='mt-1'>
                          <span className='text-sm'>{policy.schedule}</span>
                        </div>
                      </div>
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Next Run
                        </Label>
                        <div className='mt-1'>
                          <span className='text-sm'>{policy.nextRun}</span>
                        </div>
                      </div>
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Action
                        </Label>
                        <div className='mt-1'>
                          <span className='text-sm'>{policy.action}</span>
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
        <div className='bg-card text-card-foreground border-border border rounded-lg'>
          <div className='p-6 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <h3 className='text-lg font-semibold'>Instance Details</h3>
                <div className='bg-gray-800 text-white text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center'>
                  {runningInstances.length}
                </div>
              </div>
            </div>
          </div>
          <div className='px-6 pb-6'>
            <div
              className='border transition-colors rounded-lg bg-card p-4 relative border-border hover:border-gray-300'
            >
              {/* Header */}
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1 min-w-0'>
                  <h4 className='text-sm font-medium leading-none'>
                    Running Instances
                  </h4>
                </div>
              </div>

              {/* Content */}
              {runningInstances.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12'>
                  <div className='mb-6'>
                    <svg
                      width='64'
                      height='64'
                      viewBox='0 0 64 64'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                      className='text-muted-foreground'
                    >
                      <rect width='64' height='64' fill='transparent'/>
                      <path
                        d='M16 20H48C49.1046 20 50 20.8954 50 22V42C50 43.1046 49.1046 44 48 44H16C14.8954 44 14 43.1046 14 42V22C14 20.8954 14.8954 20 16 20Z'
                        stroke='currentColor'
                        strokeWidth='2'
                        fill='none'
                      />
                      <path
                        d='M20 28H28M20 32H32M20 36H24'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                      />
                    </svg>
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>No instances are currently running</h3>
                  <p className='text-sm text-gray-600 text-center max-w-md'>
                    Instances will appear here when the Auto Scaling Group creates them based on your scaling policies.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Instance ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Launch Time</TableHead>
                      <TableHead>Health Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runningInstances.map((instance, index) => (
                      <TableRow key={index}>
                        <TableCell>{instance.id}</TableCell>
                        <TableCell>
                          <StatusBadge status={instance.status} />
                        </TableCell>
                        <TableCell>{instance.type}</TableCell>
                        <TableCell>{formatDate(instance.launchTime)}</TableCell>
                        <TableCell>
                          <Badge variant={instance.healthy ? 'default' : 'destructive'}>
                            {instance.healthy ? 'Healthy' : 'Unhealthy'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
