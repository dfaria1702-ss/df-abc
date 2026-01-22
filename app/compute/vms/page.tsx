'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/page-layout';
import { VercelTabs } from '@/components/ui/vercel-tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Server,
  Play,
  Square,
  RotateCcw,
  Settings,
  Monitor,
  Activity,
  Lock,
  Unlock,
} from 'lucide-react';
import { CpuPricingCards } from './cpu/components/pricing-cards';
import { GpuPricingCards } from './gpu/components/pricing-cards';
import { GpuBaremetalPricingCards } from './gpu/components/baremetal-pricing-cards';
import {
  vmInstances,
  getVMVolumes,
  getAvailableVolumes,
  getVMSecurityGroups,
  getAvailableSecurityGroups,
  getVMPublicIPs,
  getAvailablePublicIPs,
} from '@/lib/data';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ShadcnDataTable } from '@/components/ui/shadcn-data-table';
import { StatusBadge } from '@/components/status-badge';
import { ActionMenu } from '@/components/action-menu';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
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
import { VMEditModal } from '@/components/modals/vm-edit-modal';

// VM Data and interfaces
interface VirtualMachine {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'pending' | 'error';
  vcpus: number;
  memory: string;
  storage: string;
  os: string;
  region: string;
  uptime: string;
  ip: string;
}

const mockVMs: VirtualMachine[] = [
  {
    id: 'vm-001',
    name: 'Web Server 01',
    status: 'running',
    vcpus: 4,
    memory: '16 GB',
    storage: '100 GB SSD',
    os: 'Ubuntu 22.04',
    region: 'us-west-1',
    uptime: '15 days',
    ip: '192.168.1.10',
  },
  {
    id: 'vm-002',
    name: 'Database Server',
    status: 'running',
    vcpus: 8,
    memory: '32 GB',
    storage: '500 GB SSD',
    os: 'CentOS 8',
    region: 'us-west-1',
    uptime: '23 days',
    ip: '192.168.1.20',
  },
  {
    id: 'vm-003',
    name: 'Development Server',
    status: 'stopped',
    vcpus: 2,
    memory: '8 GB',
    storage: '50 GB SSD',
    os: 'Ubuntu 22.04',
    region: 'us-east-1',
    uptime: '0 days',
    ip: '192.168.1.30',
  },
  {
    id: 'vm-004',
    name: 'Load Balancer',
    status: 'pending',
    vcpus: 2,
    memory: '4 GB',
    storage: '20 GB SSD',
    os: 'Alpine Linux',
    region: 'us-west-1',
    uptime: '0 days',
    ip: 'pending',
  },
];

// Tab content components - CPU VM with simple placeholder
function CpuVmSection() {
  return (
    <div className='space-y-6'>
      <CpuPricingCards />
    </div>
  );
}

function GpuVmSection() {
  return (
    <div className='space-y-6'>
      <GpuPricingCards />
    </div>
  );
}

function GpuBaremetalSection() {
  return (
    <div className='space-y-6'>
      <GpuBaremetalPricingCards />
    </div>
  );
}

function MyInstancesSection() {
  const router = useRouter();
  const { toast } = useToast();

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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

  // New VM attachment modal states
  const [volumeManagementModalOpen, setVolumeManagementModalOpen] =
    useState(false);
  const [
    securityGroupManagementModalOpen,
    setSecurityGroupManagementModalOpen,
  ] = useState(false);
  const [publicIPManagementModalOpen, setPublicIPManagementModalOpen] =
    useState(false);

  // VM edit modal state
  const [vmEditModalOpen, setVmEditModalOpen] = useState(false);

  // Loading states
  const [isStoppingMachine, setIsStoppingMachine] = useState(false);
  const [isRestartingMachine, setIsRestartingMachine] = useState(false);
  const [isTerminatingMachine, setIsTerminatingMachine] = useState(false);
  const [isTogglingProtection, setIsTogglingProtection] = useState(false);
  const [isCreatingImage, setIsCreatingImage] = useState(false);
  const [isRebootingMachine, setIsRebootingMachine] = useState(false);

  const [selectedVM, setSelectedVM] = useState<any>(null);

  // Delete Protection Toggle Handler
  const handleDeleteProtectionToggle = (vm: any) => {
    setSelectedVM(vm);
    if (vm.deleteProtection) {
      setDisableProtectionModalOpen(true);
    } else {
      setEnableProtectionModalOpen(true);
    }
  };

  // Stop Machine Handler
  const handleStopMachine = (vm: any) => {
    setSelectedVM(vm);
    setStopModalOpen(true);
  };

  // Restart Machine Handler
  const handleRestartMachine = (vm: any) => {
    setSelectedVM(vm);
    setRestartModalOpen(true);
  };

  // Terminate Machine Handler
  const handleTerminateMachine = (vm: any) => {
    setSelectedVM(vm);
    if (vm.deleteProtection) {
      setDeleteProtectionErrorModalOpen(true);
    } else {
      setTerminateModalOpen(true);
    }
  };

  // Create Machine Image Handler
  const handleCreateMachineImage = (vm: any) => {
    setSelectedVM(vm);
    setCreateImageModalOpen(true);
  };

  // Reboot Machine Handler
  const handleRebootMachine = (vm: any) => {
    setSelectedVM(vm);
    setRebootModalOpen(true);
  };

  // Volume Management Handler
  const handleVolumeManagement = (vm: any) => {
    setSelectedVM(vm);
    setVolumeManagementModalOpen(true);
  };

  // Security Group Management Handler
  const handleSecurityGroupManagement = (vm: any) => {
    setSelectedVM(vm);
    setSecurityGroupManagementModalOpen(true);
  };

  // Public IP Management Handler
  const handlePublicIPManagement = (vm: any) => {
    setSelectedVM(vm);
    setPublicIPManagementModalOpen(true);
  };

  // VM Edit Handler
  const handleVMEdit = (vm: any) => {
    setSelectedVM(vm);
    setVmEditModalOpen(true);
  };

  // Stop Machine Confirm
  const handleStopConfirm = async () => {
    setIsStoppingMachine(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Machine stopped successfully',
        description: `${selectedVM?.name} has been stopped.`,
      });
      setStopModalOpen(false);
      setSelectedVM(null);
    } catch (error) {
      toast({
        title: 'Failed to stop machine',
        description: 'Please try again later.',
      });
    } finally {
      setIsStoppingMachine(false);
    }
  };

  // Restart Machine Confirm
  const handleRestartConfirm = async () => {
    setIsRestartingMachine(true);
    try {
      // Simulate API call with potential failure
      await new Promise(resolve => setTimeout(resolve, 2000));
      const shouldFail = Math.random() < 0.3; // 30% chance of failure for demo

      if (shouldFail) {
        setRestartModalOpen(false);
        setRestartErrorModalOpen(true);
      } else {
        toast({
          title: 'Machine restarted successfully',
          description: `${selectedVM?.name} has been restarted.`,
        });
        setRestartModalOpen(false);
        setSelectedVM(null);
      }
    } catch (error) {
      setRestartModalOpen(false);
      setRestartErrorModalOpen(true);
    } finally {
      setIsRestartingMachine(false);
    }
  };

  // Restart Try Again
  const handleRestartTryAgain = () => {
    setRestartErrorModalOpen(false);
    setRestartModalOpen(true);
  };

  // Terminate Machine Confirm
  const handleTerminateConfirm = async () => {
    setIsTerminatingMachine(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Machine terminated successfully',
        description: `${selectedVM?.name} has been terminated.`,
      });
      setTerminateModalOpen(false);
      setSelectedVM(null);
    } catch (error) {
      toast({
        title: 'Failed to terminate machine',
        description: 'Please try again later.',
      });
    } finally {
      setIsTerminatingMachine(false);
    }
  };

  // Enable Delete Protection Confirm
  const handleEnableProtectionConfirm = async () => {
    setIsTogglingProtection(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: 'Delete protection enabled',
        description: `${selectedVM?.name} is now protected from deletion.`,
      });
      setEnableProtectionModalOpen(false);
      setSelectedVM(null);
    } catch (error) {
      toast({
        title: 'Failed to enable delete protection',
        description: 'Please try again later.',
      });
    } finally {
      setIsTogglingProtection(false);
    }
  };

  // Disable Delete Protection Confirm
  const handleDisableProtectionConfirm = async () => {
    setIsTogglingProtection(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: 'Delete protection disabled',
        description: `${selectedVM?.name} can now be deleted.`,
      });
      setDisableProtectionModalOpen(false);
      setSelectedVM(null);
    } catch (error) {
      toast({
        title: 'Failed to disable delete protection',
        description: 'Please try again later.',
      });
    } finally {
      setIsTogglingProtection(false);
    }
  };

  // Create Machine Image Confirm
  const handleCreateImageConfirm = async (imageName: string) => {
    setIsCreatingImage(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2500));
      toast({
        title: 'Machine image created successfully',
        description: `"${imageName}" has been created from ${selectedVM?.name}.`,
      });
      setCreateImageModalOpen(false);
      setSelectedVM(null);
    } catch (error) {
      toast({
        title: 'Failed to create machine image',
        description: 'Please try again later.',
      });
    } finally {
      setIsCreatingImage(false);
    }
  };

  // Reboot Machine Confirm
  const handleRebootConfirm = async () => {
    setIsRebootingMachine(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Machine rebooted successfully',
        description: `${selectedVM?.name} has been rebooted.`,
      });
      setRebootModalOpen(false);
      setSelectedVM(null);
    } catch (error) {
      toast({
        title: 'Failed to reboot machine',
        description: 'Please try again later.',
      });
    } finally {
      setIsRebootingMachine(false);
    }
  };

  // Regular Delete Handler (for backward compatibility)
  const handleDeleteClick = (vm: any) => {
    if (vm.deleteProtection) {
      setSelectedVM(vm);
      setDeleteProtectionErrorModalOpen(true);
    } else {
      setSelectedVM(vm);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    setTimeout(() => {
      toast({
        title: 'Machine deleted successfully',
        description: `${selectedVM?.name} has been deleted.`,
      });
      setDeleteModalOpen(false);
      setSelectedVM(null);
    }, 1000);
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedVM(null);
  };

  const handleRefresh = () => {
    console.log('🔄 Refreshing VM data at:', new Date().toLocaleTimeString());
    toast({
      title: 'Data refreshed',
      description: 'VM instances have been updated.',
    });
  };

  // Close all modals
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
    setVmEditModalOpen(false);
    setSelectedVM(null);
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      searchable: true,
      render: (value: any, row: any) => (
        <a
          href={`/compute/vms/instances/${row.id}`}
          className='text-primary font-medium hover:underline leading-5'
        >
          {row.name}
        </a>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value: any) => <span className='leading-5'>{value}</span>,
    },
    {
      key: 'flavour',
      label: 'Flavour',
      sortable: true,
      render: (value: any) => <span className='leading-5'>{value}</span>,
    },
    {
      key: 'vpc',
      label: 'VPC',
      sortable: true,
      render: (value: any) => <span className='leading-5'>{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: any) => <StatusBadge status={value} />,
    },
    {
      key: 'fixedIp',
      label: 'Fixed IP',
      render: (value: any) => (
        <TooltipWrapper content='Copy Fixed IP'>
          <span
            className='underline cursor-pointer'
            onClick={e => {
              e.stopPropagation();
              navigator.clipboard.writeText(value);
            }}
          >
            {value}
          </span>
        </TooltipWrapper>
      ),
    },
    {
      key: 'publicIp',
      label: 'Public IP',
      render: (value: any) => (
        <TooltipWrapper content='Copy Public IP'>
          <span
            className='underline cursor-pointer'
            onClick={e => {
              e.stopPropagation();
              navigator.clipboard.writeText(value);
            }}
          >
            {value}
          </span>
        </TooltipWrapper>
      ),
    },
    {
      key: 'createdOn',
      label: 'Created On',
      sortable: true,
      render: (value: any) => {
        const date = new Date(value);
        return (
          <div className='text-muted-foreground leading-5'>
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </div>
        );
      },
    },
    {
      key: 'deleteProtection',
      label: 'Delete Protection',
      align: 'center' as const,
      render: (value: any, row: any) => (
        <div className='flex justify-center'>
          <TooltipWrapper
            content={
              value ? 'Disable delete protection' : 'Enable delete protection'
            }
          >
            <button
              onClick={e => {
                e.stopPropagation();
                handleDeleteProtectionToggle(row);
              }}
              className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors'
            >
              {value ? (
                <Lock className='w-4 h-4 text-red-600' />
              ) : (
                <Unlock className='w-4 h-4 text-gray-400' />
              )}
            </button>
          </TooltipWrapper>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right' as const,
      render: (value: any, row: any) => {
        // Determine available actions based on VM status
        const isRunning = row.status === 'Active';
        const isStopped = row.status === 'Stopped';
        const isRestarting = row.status === 'Restarting';

        return (
          <div className='flex justify-end'>
            <VMActionMenu
              vm={row}
              isRunning={isRunning}
              isStopped={isStopped}
              isRestarting={isRestarting}
              onStop={() => handleStopMachine(row)}
              onRestart={() => handleRestartMachine(row)}
              onTerminate={() => handleTerminateMachine(row)}
              onCreateImage={() => handleCreateMachineImage(row)}
              onReboot={() => handleRebootMachine(row)}
              onAttachDetachVolumes={() => handleVolumeManagement(row)}
              onAttachDetachSecurityGroups={() =>
                handleSecurityGroupManagement(row)
              }
              onAttachDetachPublicIP={() => handlePublicIPManagement(row)}
              onEdit={() => handleVMEdit(row)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <ShadcnDataTable
        columns={columns}
        data={vmInstances}
        onRefresh={handleRefresh}
      />

      {/* All VM Management Modals */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        resourceName={selectedVM?.name}
        resourceType='VM Instance'
      />

      <StopMachineModal
        open={stopModalOpen}
        onClose={closeAllModals}
        onConfirm={handleStopConfirm}
        machineName={selectedVM?.name || ''}
        isLoading={isStoppingMachine}
      />

      <RestartMachineModal
        open={restartModalOpen}
        onClose={closeAllModals}
        onConfirm={handleRestartConfirm}
        machineName={selectedVM?.name || ''}
        isLoading={isRestartingMachine}
      />

      <RestartErrorModal
        open={restartErrorModalOpen}
        onClose={closeAllModals}
        onTryAgain={handleRestartTryAgain}
        machineName={selectedVM?.name || ''}
      />

      <TerminateMachineModal
        open={terminateModalOpen}
        onClose={closeAllModals}
        onConfirm={handleTerminateConfirm}
        machineName={selectedVM?.name || ''}
        isLoading={isTerminatingMachine}
      />

      <DeleteProtectionErrorModal
        open={deleteProtectionErrorModalOpen}
        onClose={closeAllModals}
        machineName={selectedVM?.name || ''}
      />

      <EnableDeleteProtectionModal
        open={enableProtectionModalOpen}
        onClose={closeAllModals}
        onConfirm={handleEnableProtectionConfirm}
        machineName={selectedVM?.name || ''}
        isLoading={isTogglingProtection}
      />

      <DisableDeleteProtectionModal
        open={disableProtectionModalOpen}
        onClose={closeAllModals}
        onConfirm={handleDisableProtectionConfirm}
        machineName={selectedVM?.name || ''}
        isLoading={isTogglingProtection}
      />

      <CreateMachineImageModal
        open={createImageModalOpen}
        onClose={closeAllModals}
        onConfirm={handleCreateImageConfirm}
        machineName={selectedVM?.name || ''}
        isLoading={isCreatingImage}
      />

      <RebootMachineModal
        open={rebootModalOpen}
        onClose={closeAllModals}
        onConfirm={handleRebootConfirm}
        machineName={selectedVM?.name || ''}
        isLoading={isRebootingMachine}
      />

      {/* VM Edit Modal */}
      {selectedVM && (
        <VMEditModal
          open={vmEditModalOpen}
          onClose={() => setVmEditModalOpen(false)}
          vmId={selectedVM.id}
          vmName={selectedVM.name}
          initialDescription={selectedVM.description || ''}
          initialTags={selectedVM.tags || []}
        />
      )}

      {/* New VM attachment/detachment modals */}
      {selectedVM && (
        <>
          <VolumeManagementModal
            open={volumeManagementModalOpen}
            onClose={() => setVolumeManagementModalOpen(false)}
            vmName={selectedVM.name}
            attachedVolumes={getVMVolumes(selectedVM.id)}
            availableVolumes={getAvailableVolumes()}
          />

          <SecurityGroupManagementModal
            open={securityGroupManagementModalOpen}
            onClose={() => setSecurityGroupManagementModalOpen(false)}
            vmId={selectedVM.id}
            vmName={selectedVM.name}
            attachedSecurityGroups={getVMSecurityGroups(selectedVM.id)}
            availableSecurityGroups={getAvailableSecurityGroups(selectedVM.id)}
          />

          <PublicIPManagementModal
            open={publicIPManagementModalOpen}
            onClose={() => setPublicIPManagementModalOpen(false)}
            vmName={selectedVM.name}
            attachedIPs={getVMPublicIPs(selectedVM.id)}
            availableIPs={getAvailablePublicIPs()}
          />
        </>
      )}
    </>
  );
}

// Enhanced Action Menu Component for VMs
interface VMActionMenuProps {
  vm: any;
  isRunning: boolean;
  isStopped: boolean;
  isRestarting: boolean;
  onStop: () => void;
  onRestart: () => void;
  onTerminate: () => void;
  onCreateImage: () => void;
  onReboot: () => void;
  onAttachDetachVolumes: () => void;
  onAttachDetachSecurityGroups: () => void;
  onAttachDetachPublicIP: () => void;
  onEdit: () => void;
}

function VMActionMenu({
  vm,
  isRunning,
  isStopped,
  isRestarting,
  onStop,
  onRestart,
  onTerminate,
  onCreateImage,
  onReboot,
  onAttachDetachVolumes,
  onAttachDetachSecurityGroups,
  onAttachDetachPublicIP,
  onEdit,
}: VMActionMenuProps) {
  // Build metrics URL with resource name, 6 hours time range, and 1 min granularity
  const metricsHref = `/observability/metrics/vm?resource=${encodeURIComponent(vm.name)}&timeRange=6&granularity=1`;

  return (
    <ActionMenu
      viewHref={`/compute/vms/instances/${vm.id}`}
      resourceName={vm.name}
      resourceType='VM Instance'
      deleteLabel='Terminate Machine'
      onCustomDelete={onTerminate}
      onEdit={onEdit}
      metricsHref={metricsHref}
      // Show Stop action only for running VMs
      {...(isRunning && { onStop: onStop })}
      // Show Restart action only for stopped VMs
      {...(isStopped && { onRestart: onRestart })}
      // Show Reboot action for running VMs
      {...(isRunning && { onReboot: onReboot })}
      // Create Image action available for all VMs
      onCreateImage={onCreateImage}
      // New VM attachment/detachment actions
      onAttachDetachVolumes={onAttachDetachVolumes}
      onAttachDetachSecurityGroups={onAttachDetachSecurityGroups}
      onAttachDetachPublicIP={onAttachDetachPublicIP}
    />
  );
}

const tabs = [
  { id: 'cpu', label: 'CPU VMs' },
  { id: 'gpu', label: 'GPU VMs' },
  { id: 'gpu-baremetal', label: 'GPU Baremetal' },
  { id: 'instances', label: 'My Instances' },
];

export default function VMsPage() {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab from URL, but don't change URL on tab change
  const getActiveTabFromPath = () => {
    if (pathname.includes('/cpu')) {
      return 'cpu';
    }
    if (pathname.includes('/gpu')) {
      return 'gpu';
    }
    if (pathname.includes('/gpu-baremetal')) {
      return 'gpu-baremetal';
    }
    if (pathname.includes('/instances')) {
      return 'instances';
    }
    return 'cpu'; // default to cpu
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  // Handle tab change without URL navigation to prevent refreshes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Don't navigate - just change the local state
  };

  // Update active tab when URL changes (for direct navigation)
  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [pathname]);

  // Get title and description based on active tab
  const getPageInfo = () => {
    switch (activeTab) {
      case 'cpu':
        return {
          title: 'CPU Virtual Machines',
          description: 'Create and manage CPU-based virtual machines',
        };
      case 'gpu':
        return {
          title: 'GPU Virtual Machines',
          description: 'Create and manage GPU-accelerated virtual machines',
        };
      case 'gpu-baremetal':
        return {
          title: 'GPU Baremetal',
          description: 'Deploy dedicated GPU servers with full hardware access',
        };
      case 'instances':
        return {
          title: 'My Instances',
          description: 'View and manage all your virtual machine instances',
        };
      default:
        return {
          title: 'Virtual Machines',
          description: 'Manage your virtual machine resources',
        };
    }
  };

  const { title, description } = getPageInfo();

  return (
    <TooltipProvider>
      <PageLayout title={title} description={description}>
        <div className='space-y-6'>
          <VercelTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            size='lg'
          />

          {activeTab === 'cpu' && <CpuVmSection />}
          {activeTab === 'gpu' && <GpuVmSection />}
          {activeTab === 'gpu-baremetal' && <GpuBaremetalSection />}
          {activeTab === 'instances' && <MyInstancesSection />}
        </div>
      </PageLayout>
    </TooltipProvider>
  );
}
