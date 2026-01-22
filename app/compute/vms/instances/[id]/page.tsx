'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  vmInstances,
  getVMVolumes,
  getAvailableVolumes,
  getVMSecurityGroups,
  getAvailableSecurityGroups,
  getVMPublicIPs,
  getAvailablePublicIPs,
} from '@/lib/data';
import {
  Edit,
  Trash2,
  HardDrive,
  Network,
  Shield,
  Key,
  FileText,
  Tag,
  DollarSign,
  MoreVertical,
  Square,
  RotateCcw,
  RefreshCw,
  Image,
  Wifi,
  BarChart3,
} from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { PageLayout } from '@/components/page-layout';
import { DetailSection } from '@/components/detail-section';
import { DetailGrid } from '@/components/detail-grid';
import { DetailItem } from '@/components/detail-item';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { VMEditModal } from '@/components/modals/vm-edit-modal';
import { useToast } from '@/hooks/use-toast';
import {
  StopMachineModal,
  RestartMachineModal,
  RestartErrorModal,
  TerminateMachineModal,
  DeleteProtectionErrorModal,
  EnableDeleteProtectionModal,
  DisableDeleteProtectionModal,
  CreateMachineImageModal,
  RebootMachineModal,
} from '@/components/modals/vm-management-modals';
import {
  VolumeManagementModal,
  SecurityGroupManagementModal,
  PublicIPManagementModal,
} from '@/components/modals/vm-attachment-modals';

export default function VMInstanceDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  // VM Edit Modal state
  const [vmEditModalOpen, setVmEditModalOpen] = useState(false);

  // VM Management Modal states
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [restartModalOpen, setRestartModalOpen] = useState(false);
  const [restartErrorModalOpen, setRestartErrorModalOpen] = useState(false);
  const [terminateModalOpen, setTerminateModalOpen] = useState(false);
  const [deleteProtectionErrorModalOpen, setDeleteProtectionErrorModalOpen] =
    useState(false);
  const [enableProtectionModalOpen, setEnableProtectionModalOpen] =
    useState(false);
  const [disableProtectionModalOpen, setDisableProtectionModalOpen] =
    useState(false);
  const [createImageModalOpen, setCreateImageModalOpen] = useState(false);
  const [rebootModalOpen, setRebootModalOpen] = useState(false);

  // VM attachment modal states
  const [volumeManagementModalOpen, setVolumeManagementModalOpen] =
    useState(false);
  const [
    securityGroupManagementModalOpen,
    setSecurityGroupManagementModalOpen,
  ] = useState(false);
  const [publicIPManagementModalOpen, setPublicIPManagementModalOpen] =
    useState(false);

  // Loading states
  const [isStoppingMachine, setIsStoppingMachine] = useState(false);
  const [isRestartingMachine, setIsRestartingMachine] = useState(false);
  const [isTerminatingMachine, setIsTerminatingMachine] = useState(false);
  const [isTogglingProtection, setIsTogglingProtection] = useState(false);
  const [isCreatingImage, setIsCreatingImage] = useState(false);
  const [isRebootingMachine, setIsRebootingMachine] = useState(false);

  const vm = vmInstances.find(v => v.id === id);

  if (!vm) {
    return (
      <div className='p-8 text-center text-gray-500'>Instance not found</div>
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
    { href: '/compute/vms', title: 'Virtual Machines' },
    { href: `/compute/vms/instances/${vm.id}`, title: vm.name },
  ];

  const config = vm.configuration;

  // Helper functions to determine VM state
  const isRunning = vm.status === 'Active';
  const isStopped = vm.status === 'Stopped';
  const isRestarting = vm.status === 'Restarting';

  // Action handlers
  const handleStopMachine = () => {
    setStopModalOpen(true);
  };

  const handleRestartMachine = () => {
    setRestartModalOpen(true);
  };

  const handleRebootMachine = () => {
    setRebootModalOpen(true);
  };

  const handleTerminateMachine = () => {
    if (vm.deleteProtection) {
      setDeleteProtectionErrorModalOpen(true);
    } else {
      setTerminateModalOpen(true);
    }
  };

  const handleCreateMachineImage = () => {
    setCreateImageModalOpen(true);
  };

  const handleVolumeManagement = () => {
    setVolumeManagementModalOpen(true);
  };

  const handleSecurityGroupManagement = () => {
    setSecurityGroupManagementModalOpen(true);
  };

  const handlePublicIPManagement = () => {
    setPublicIPManagementModalOpen(true);
  };

  // Modal confirmation handlers
  const handleStopConfirm = async () => {
    setIsStoppingMachine(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Machine stopped successfully',
        description: `${vm.name} has been stopped.`,
      });
      setStopModalOpen(false);
    } catch (error) {
      toast({
        title: 'Failed to stop machine',
        description: 'Please try again later.',
      });
    } finally {
      setIsStoppingMachine(false);
    }
  };

  const handleRestartConfirm = async () => {
    setIsRestartingMachine(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Machine restarted successfully',
        description: `${vm.name} has been restarted.`,
      });
      setRestartModalOpen(false);
    } catch (error) {
      toast({
        title: 'Failed to restart machine',
        description: 'Please try again later.',
      });
    } finally {
      setIsRestartingMachine(false);
    }
  };

  const handleRebootConfirm = async () => {
    setIsRebootingMachine(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Machine rebooted successfully',
        description: `${vm.name} has been rebooted.`,
      });
      setRebootModalOpen(false);
    } catch (error) {
      toast({
        title: 'Failed to reboot machine',
        description: 'Please try again later.',
      });
    } finally {
      setIsRebootingMachine(false);
    }
  };

  const handleTerminateConfirm = async () => {
    setIsTerminatingMachine(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Machine terminated successfully',
        description: `${vm.name} has been terminated.`,
      });
      setTerminateModalOpen(false);
      router.push('/compute/vms');
    } catch (error) {
      toast({
        title: 'Failed to terminate machine',
        description: 'Please try again later.',
      });
    } finally {
      setIsTerminatingMachine(false);
    }
  };

  const handleCreateImageConfirm = async (imageName: string) => {
    setIsCreatingImage(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Machine image created successfully',
        description: `Image "${imageName}" has been created from ${vm.name}.`,
      });
      setCreateImageModalOpen(false);
    } catch (error) {
      toast({
        title: 'Failed to create machine image',
        description: 'Please try again later.',
      });
    } finally {
      setIsCreatingImage(false);
    }
  };

  const closeAllModals = () => {
    setStopModalOpen(false);
    setRestartModalOpen(false);
    setRestartErrorModalOpen(false);
    setTerminateModalOpen(false);
    setDeleteProtectionErrorModalOpen(false);
    setEnableProtectionModalOpen(false);
    setDisableProtectionModalOpen(false);
    setCreateImageModalOpen(false);
    setRebootModalOpen(false);
    setVolumeManagementModalOpen(false);
    setSecurityGroupManagementModalOpen(false);
    setPublicIPManagementModalOpen(false);
  };

  return (
    <PageLayout
      title={vm.name}
      customBreadcrumbs={customBreadcrumbs}
      hideViewDocs={true}
    >
      <div className='space-y-6'>
        {/* Basic Information */}
        <div
          className='mb-6 group relative'
          style={{
            borderRadius: '16px',
            border: '4px solid #FFF',
            background:
              'linear-gradient(265deg, #FFF -13.17%, #F7F8FD 133.78%)',
            boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)',
            padding: '1.5rem',
          }}
        >
          {/* Overlay Actions Button */}
          <div className='absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 px-3 text-muted-foreground hover:text-foreground bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
                >
                  <MoreVertical className='h-4 w-4 mr-1' />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='border-border min-w-[200px]'
              >
                {/* Edit VM Details */}
                <DropdownMenuItem
                  onClick={() => setVmEditModalOpen(true)}
                  className='flex items-center cursor-pointer'
                >
                  <Edit className='mr-2 h-4 w-4' />
                  <span>Edit VM Details</span>
                </DropdownMenuItem>

                <div className='h-px bg-border my-1' />

                {/* Stop Machine - only for running VMs */}
                {isRunning && (
                  <DropdownMenuItem
                    onClick={handleStopMachine}
                    className='flex items-center cursor-pointer'
                  >
                    <Square className='mr-2 h-4 w-4' />
                    <span>Stop Machine</span>
                  </DropdownMenuItem>
                )}

                {/* Restart Machine - only for stopped VMs */}
                {isStopped && (
                  <DropdownMenuItem
                    onClick={handleRestartMachine}
                    className='flex items-center cursor-pointer'
                  >
                    <RotateCcw className='mr-2 h-4 w-4' />
                    <span>Restart Machine</span>
                  </DropdownMenuItem>
                )}

                {/* Reboot Machine - only for running VMs */}
                {isRunning && (
                  <DropdownMenuItem
                    onClick={handleRebootMachine}
                    className='flex items-center cursor-pointer'
                  >
                    <RefreshCw className='mr-2 h-4 w-4' />
                    <span>Reboot Machine</span>
                  </DropdownMenuItem>
                )}

                {/* Create Machine Image - available for all VMs */}
                <DropdownMenuItem
                  onClick={handleCreateMachineImage}
                  className='flex items-center cursor-pointer'
                >
                  <Image className='mr-2 h-4 w-4' />
                  <span>Create Machine Image</span>
                </DropdownMenuItem>

                {/* Attach/Detach Volumes */}
                <DropdownMenuItem
                  onClick={handleVolumeManagement}
                  className='flex items-center cursor-pointer'
                >
                  <HardDrive className='mr-2 h-4 w-4' />
                  <span>Attach/Detach Volumes</span>
                </DropdownMenuItem>

                {/* Attach/Detach Security Groups */}
                <DropdownMenuItem
                  onClick={handleSecurityGroupManagement}
                  className='flex items-center cursor-pointer'
                >
                  <Shield className='mr-2 h-4 w-4' />
                  <span>Attach/Detach Security Groups</span>
                </DropdownMenuItem>

                {/* Attach/Detach Public IP */}
                <DropdownMenuItem
                  onClick={handlePublicIPManagement}
                  className='flex items-center cursor-pointer'
                >
                  <Wifi className='mr-2 h-4 w-4' />
                  <span>Attach/Detach Public IP</span>
                </DropdownMenuItem>

                <div className='h-px bg-border my-1' />

                {/* View Metrics */}
                <DropdownMenuItem
                  onClick={() => {
                    const metricsUrl = `/observability/metrics/vm?resource=${encodeURIComponent(vm.name)}&timeRange=6&granularity=1`;
                    router.push(metricsUrl);
                  }}
                  className='flex items-center cursor-pointer'
                >
                  <BarChart3 className='mr-2 h-4 w-4' />
                  <span>View Metrics</span>
                </DropdownMenuItem>

                <div className='h-px bg-border my-1' />

                {/* Terminate Machine - destructive action */}
                <DropdownMenuItem
                  onClick={handleTerminateMachine}
                  className='flex items-center text-destructive focus:text-destructive cursor-pointer'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  <span>Terminate Machine</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <DetailGrid>
            {/* Instance ID, Type, Flavour, VPC in one row */}
            <div className='col-span-full grid grid-cols-4 gap-4'>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Instance ID
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {vm.id}
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Type
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {vm.type}
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
                  {vm.flavour}
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  VPC
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {config.vpcName}
                </div>
              </div>
            </div>

            {/* Status, Region, Created On, Delete Protection in one row */}
            <div className='col-span-full grid grid-cols-4 gap-4'>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Status
                </label>
                <div>
                  <StatusBadge status={vm.status} />
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
                  {config.region}
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
                  {formatDate(vm.createdOn)}
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Delete Protection
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {vm.deleteProtection ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>

            {/* Description */}
            {vm.description && (
              <div className='col-span-full'>
                <div className='space-y-1'>
                  <label
                    className='text-sm font-normal text-gray-700'
                    style={{ fontSize: '13px' }}
                  >
                    Description
                  </label>
                  <div className='font-medium' style={{ fontSize: '14px' }}>
                    {vm.description}
                  </div>
                </div>
              </div>
            )}
          </DetailGrid>
        </div>

        {/* Volume Configuration */}
        <DetailSection title='Volume Configuration'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Bootable Volume */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>Bootable Volume</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>Type</span>
                  <span className='text-sm font-medium capitalize'>
                    {config.bootableVolume.type}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>Name</span>
                  <span className='text-sm font-medium'>
                    {config.bootableVolume.volumeName}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>Size</span>
                  <span className='text-sm font-medium'>
                    {config.bootableVolume.size}
                  </span>
                </div>
                {config.bootableVolume.image && (
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Image</span>
                    <span className='text-sm font-medium'>
                      {config.bootableVolume.image}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Storage Volumes */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>Storage Volumes</CardTitle>
              </CardHeader>
              <CardContent>
                {config.storageVolumes.length > 0 ? (
                  <div className='space-y-3'>
                    {config.storageVolumes.map((volume, index) => (
                      <div
                        key={volume.id}
                        className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'
                      >
                        <div>
                          <div className='font-medium text-sm'>
                            {volume.name}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {volume.size} • {volume.type.toUpperCase()}
                          </div>
                        </div>
                        <Badge variant='secondary'>{volume.id}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No additional storage volumes
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </DetailSection>

        {/* Network Configuration */}
        <DetailSection title='Network Configuration'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Subnet */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>Subnet</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>Name</span>
                  <span className='text-sm font-medium'>
                    {config.subnet.name}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>Type</span>
                  <span className='text-sm font-medium'>
                    {config.subnet.type}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>CIDR</span>
                  <span className='text-sm font-medium font-mono'>
                    {config.subnet.cidr}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Network Speed
                  </span>
                  <span className='text-sm font-medium'>
                    {config.networkSpeed}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Security Group */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>Security Group</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>Name</span>
                  <span className='text-sm font-medium'>
                    {config.securityGroup.name}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Description
                  </span>
                  <span className='text-sm font-medium'>
                    {config.securityGroup.description}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    IP Address Type
                  </span>
                  <span className='text-sm font-medium capitalize'>
                    {config.ipAddressType} IP
                  </span>
                </div>
                {config.reservedIp && (
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Reserved IP
                    </span>
                    <span className='text-sm font-medium font-mono'>
                      {typeof config.reservedIp === 'string'
                        ? config.reservedIp
                        : config.reservedIp.address}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DetailSection>

        {/* SSH Configuration and Tags */}
        <DetailSection title='SSH Configuration and Tags'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* SSH Configuration */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>SSH Configuration</CardTitle>
              </CardHeader>
              <CardContent className='pt-6'>
                <div className='flex justify-between items-center'>
                  <div>
                    <div className='font-medium'>{config.sshKey.name}</div>
                    <div className='text-sm text-muted-foreground'>
                      SSH Key ID: {config.sshKey.id}
                    </div>
                  </div>
                  <Badge variant='outline'>Active</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {vm.tags && vm.tags.length > 0 && (
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base'>Tags</CardTitle>
                </CardHeader>
                <CardContent className='pt-6'>
                  <div className='flex flex-wrap gap-2'>
                    {vm.tags.map((tag, index) => (
                      <Badge key={index} variant='secondary'>
                        {tag.key}: {tag.value}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DetailSection>

        {/* Startup Script */}
        {config.startupScript && (
          <DetailSection title='Startup Script'>
            <Card>
              <CardContent className='pt-6'>
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <pre className='text-sm font-mono text-gray-800 whitespace-pre-wrap'>
                    {config.startupScript}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </DetailSection>
        )}

        {/* Pricing Information */}
        <DetailSection title='Pricing Information'>
          <div
            className='p-4 rounded-lg'
            style={{
              boxShadow: 'rgba(14, 114, 180, 0.1) 0px 0px 0px 1px inset',
              background:
                'linear-gradient(263deg, rgba(15, 123, 194, 0.08) 6.86%, rgba(15, 123, 194, 0.02) 96.69%)',
            }}
          >
            <div className='flex items-center gap-2 mb-3'>
              <span className='text-sm font-medium text-black'>
                Cost Breakdown
              </span>
            </div>

            <div className='space-y-3 mb-4'>
              <div className='flex justify-between items-center'>
                <label
                  className='text-sm font-normal text-black'
                  style={{ fontSize: '13px' }}
                >
                  VM Cost
                </label>
                <div
                  className='font-semibold text-black'
                  style={{ fontSize: '16px' }}
                >
                  ₹{config.pricing.vm}/hr
                </div>
              </div>
              {config.pricing.storage > 0 && (
                <div className='flex justify-between items-center'>
                  <label
                    className='text-sm font-normal text-black'
                    style={{ fontSize: '13px' }}
                  >
                    Storage Cost
                  </label>
                  <div
                    className='font-semibold text-black'
                    style={{ fontSize: '16px' }}
                  >
                    ₹{config.pricing.storage}/hr
                  </div>
                </div>
              )}
              {config.pricing.ip > 0 && (
                <div className='flex justify-between items-center'>
                  <label
                    className='text-sm font-normal text-black'
                    style={{ fontSize: '13px' }}
                  >
                    IP Address Cost
                  </label>
                  <div
                    className='font-semibold text-black'
                    style={{ fontSize: '16px' }}
                  >
                    ₹{config.pricing.ip}/hr
                  </div>
                </div>
              )}
              <div className='flex justify-between items-center'>
                <label
                  className='text-sm font-normal text-black'
                  style={{ fontSize: '13px' }}
                >
                  Total Cost
                </label>
                <div className='font-bold text-black text-xl'>
                  ₹{config.pricing.total}/hr
                </div>
              </div>
            </div>

            <div
              className='pt-4 border-t'
              style={{ borderColor: 'rgba(14, 114, 180, 0.2)' }}
            >
              <div className='flex items-center justify-between'>
                <span className='text-black text-sm'>Monthly estimate</span>
                <span className='text-black font-bold text-lg'>
                  ₹{(config.pricing.total * 24 * 30).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </DetailSection>
      </div>

      {/* VM Edit Modal */}
      <VMEditModal
        open={vmEditModalOpen}
        onClose={() => setVmEditModalOpen(false)}
        vmId={vm.id}
        vmName={vm.name}
        initialDescription={vm.description || ''}
        initialTags={vm.tags || []}
      />

      {/* VM Management Modals */}
      <StopMachineModal
        open={stopModalOpen}
        onClose={closeAllModals}
        onConfirm={handleStopConfirm}
        machineName={vm.name}
        isLoading={isStoppingMachine}
      />

      <RestartMachineModal
        open={restartModalOpen}
        onClose={closeAllModals}
        onConfirm={handleRestartConfirm}
        machineName={vm.name}
        isLoading={isRestartingMachine}
      />

      <RestartErrorModal
        open={restartErrorModalOpen}
        onClose={closeAllModals}
        onTryAgain={handleRestartConfirm}
        machineName={vm.name}
      />

      <TerminateMachineModal
        open={terminateModalOpen}
        onClose={closeAllModals}
        onConfirm={handleTerminateConfirm}
        machineName={vm.name}
        isLoading={isTerminatingMachine}
      />

      <DeleteProtectionErrorModal
        open={deleteProtectionErrorModalOpen}
        onClose={closeAllModals}
        machineName={vm.name}
      />

      <EnableDeleteProtectionModal
        open={enableProtectionModalOpen}
        onClose={closeAllModals}
        onConfirm={async () => {
          setIsTogglingProtection(true);
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast({
              title: 'Delete protection enabled',
              description: `Delete protection has been enabled for ${vm.name}.`,
            });
            setEnableProtectionModalOpen(false);
          } catch (error) {
            toast({
              title: 'Failed to enable delete protection',
              description: 'Please try again later.',
            });
          } finally {
            setIsTogglingProtection(false);
          }
        }}
        machineName={vm.name}
        isLoading={isTogglingProtection}
      />

      <DisableDeleteProtectionModal
        open={disableProtectionModalOpen}
        onClose={closeAllModals}
        onConfirm={async () => {
          setIsTogglingProtection(true);
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast({
              title: 'Delete protection disabled',
              description: `Delete protection has been disabled for ${vm.name}.`,
            });
            setDisableProtectionModalOpen(false);
          } catch (error) {
            toast({
              title: 'Failed to disable delete protection',
              description: 'Please try again later.',
            });
          } finally {
            setIsTogglingProtection(false);
          }
        }}
        machineName={vm.name}
        isLoading={isTogglingProtection}
      />

      <CreateMachineImageModal
        open={createImageModalOpen}
        onClose={closeAllModals}
        onConfirm={handleCreateImageConfirm}
        machineName={vm.name}
        isLoading={isCreatingImage}
      />

      <RebootMachineModal
        open={rebootModalOpen}
        onClose={closeAllModals}
        onConfirm={handleRebootConfirm}
        machineName={vm.name}
        isLoading={isRebootingMachine}
      />

      {/* VM Attachment Modals */}
      <VolumeManagementModal
        open={volumeManagementModalOpen}
        onClose={() => setVolumeManagementModalOpen(false)}
        vmName={vm.name}
        attachedVolumes={getVMVolumes(vm.id)}
        availableVolumes={getAvailableVolumes()}
      />

      <SecurityGroupManagementModal
        open={securityGroupManagementModalOpen}
        onClose={() => setSecurityGroupManagementModalOpen(false)}
        vmId={vm.id}
        vmName={vm.name}
        attachedSecurityGroups={getVMSecurityGroups(vm.id)}
        availableSecurityGroups={getAvailableSecurityGroups(vm.id)}
      />

      <PublicIPManagementModal
        open={publicIPManagementModalOpen}
        onClose={() => setPublicIPManagementModalOpen(false)}
        vmName={vm.name}
        attachedIPs={getVMPublicIPs(vm.id)}
        availableIPs={getAvailablePublicIPs()}
      />
    </PageLayout>
  );
}
