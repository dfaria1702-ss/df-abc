'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { PageLayout } from '@/components/page-layout'
import { DetailGrid } from '@/components/detail-grid'
import { StatusBadge } from '@/components/status-badge'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { Edit, Trash2 } from 'lucide-react'
import { 
  autoScalingTemplates
} from '@/lib/data'

export default function TemplateDetailsPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const template = autoScalingTemplates.find(t => t.id === id);

  if (!template) {
    return (
      <div className='p-8 text-center text-gray-500'>
        <h2 className='text-xl font-semibold mb-2'>Template Not Found</h2>
        <p>The template you're looking for doesn't exist.</p>
      </div>
    );
  }

  const customBreadcrumbs = [
    { href: '/dashboard', title: 'Home' },
    { href: '/compute', title: 'Compute' },
    { href: '/compute/auto-scaling', title: 'Auto Scaling Groups' },
    { href: '/compute/auto-scaling/templates', title: 'Templates' },
    { href: `/compute/auto-scaling/templates/${template.id}`, title: 'cache-server-template' },
  ];

  // Mock template data to match Create Template structure
  const templateData = {
    // Template Name
    templateName: "cache-server-template",
    
    // Instance Configuration
    instanceName: "cache-server-template-instance",
    instanceType: "t3.medium",
    
    // Storage Configuration
    bootVolumeName: "cache-server-template-boot",
    bootVolumeSize: 20,
    machineImage: template.imageId || "ami-ubuntu-22.04",
    storageVolumes: [
      {
        id: "vol-1",
        name: "data-volume",
        size: 100,
        type: "Standard"
      }
    ],
    
    // Scripts & Tags
    sshKey: template.keyName || "ssh-key-2",
    startupScript: template.userData || "#!/bin/bash\necho 'Template startup script'",
    tags: [
      { key: "Environment", value: "Production" },
      { key: "Template", value: "cache-server-template" },
      { key: "Version", value: "V6" }
    ],
    
    // Network Configuration
    region: "us-east-1",
    vpc: "vpc-default",
    subnet: "subnet-public-1a",
    securityGroups: ["sg-web-servers", "sg-database"],
    
    // Auto Scaling Policies
    scalingPolicies: [
      {
        id: "policy-1",
        type: "CPU Utilization",
        metric: "Average CPU",
        threshold: "75%",
        action: "Scale out by 1 instance",
        scaleOutCooldown: 300,
        scaleInCooldown: 300
      },
      {
        id: "policy-2", 
        type: "Memory Utilization",
        metric: "Average Memory",
        threshold: "80%",
        action: "Scale out by 1 instance",
        scaleOutCooldown: 300,
        scaleInCooldown: 300
      }
    ]
  };

  // Mock data definitions
  const instanceTypes = [
    { id: "cpu-1x-4gb", name: "CPU-1x-4GB", vcpus: 1, ram: 4, pricePerHour: 3 },
    { id: "cpu-2x-8gb", name: "CPU-2x-8GB", vcpus: 2, ram: 8, pricePerHour: 6 },
    { id: "cpu-4x-16gb", name: "CPU-4x-16GB", vcpus: 4, ram: 16, pricePerHour: 13 },
    { id: "cpu-8x-32gb", name: "CPU-8x-32GB", vcpus: 8, ram: 32, pricePerHour: 25 },
    { id: "cpu-16x-64gb", name: "CPU-16x-64GB", vcpus: 16, ram: 64, pricePerHour: 49 },
    { id: "cpu-32x-128gb", name: "CPU-32x-128GB", vcpus: 32, ram: 128, pricePerHour: 97 }
  ];

  const machineImages = [
    { id: "ami-ubuntu-20.04", name: "Ubuntu 20.04 LTS" },
    { id: "ami-ubuntu-22.04", name: "Ubuntu 22.04 LTS" },
    { id: "ami-amazon-linux-2", name: "Amazon Linux 2" },
    { id: "ami-centos-7", name: "CentOS 7" },
    { id: "ami-rhel-8", name: "Red Hat Enterprise Linux 8" }
  ];

  const sshKeys = [
    { id: "ssh-key-1", name: "development-key" },
    { id: "ssh-key-2", name: "production-key" },
    { id: "ssh-key-3", name: "staging-key" }
  ];

  const mockSecurityGroups = [
    { id: "sg-web-servers", name: "Web Servers", description: "HTTP/HTTPS traffic" },
    { id: "sg-database", name: "Database", description: "Database access" },
    { id: "sg-ssh", name: "SSH Access", description: "SSH access" }
  ];

  // Helper functions
  const getInstanceTypeDetails = (typeId: string) => {
    return instanceTypes.find(t => t.id === typeId) || instanceTypes[2]; // default to cpu-4x-16gb
  };

  const getMachineImageDetails = (imageId: string) => {
    return machineImages.find(img => img.id === imageId) || machineImages[1]; // default to Ubuntu 22.04
  };

  const getSSHKeyDetails = (keyId: string) => {
    return sshKeys.find(key => key.id === keyId) || sshKeys[1]; // default to production-key
  };

  const getSecurityGroupDetails = (sgIds: string[]) => {
    return sgIds.map(id => mockSecurityGroups.find(sg => sg.id === id)).filter(Boolean);
  };


  // Action handlers
  const handleEdit = () => {
    window.location.href = `/compute/auto-scaling/templates/${template.id}/edit`;
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    toast({
      title: "Template deleted",
      description: `cache-server-template has been deleted successfully.`,
    });
    setIsDeleteModalOpen(false);
    // In a real app, you would navigate back to the listing page
    // window.location.href = '/compute/auto-scaling';
  };

  const instanceTypeDetails = getInstanceTypeDetails(templateData.instanceType);
  const machineImageDetails = getMachineImageDetails(templateData.machineImage);
  const sshKeyDetails = getSSHKeyDetails(templateData.sshKey);
  const securityGroupDetails = getSecurityGroupDetails(templateData.securityGroups);

  return (
    <PageLayout
      title={templateData.templateName}
      customBreadcrumbs={customBreadcrumbs}
      hideViewDocs={true}
    >
      <div className='space-y-8'>
        {/* Template Basic Information */}
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
              className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>

          <DetailGrid>
            {/* Template Name, Status, Version, Created On */}
            <div className='col-span-full grid grid-cols-4 gap-4'>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Template Name
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {templateData.templateName}
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
                  <StatusBadge status="active" />
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Version
                </label>
                <div>
                  <Badge variant="secondary" className="bg-black text-white text-xs font-medium hover:bg-black hover:text-white cursor-default">
                    V6
                  </Badge>
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
                  22/01/2024
                </div>
              </div>
            </div>
          </DetailGrid>
        </div>

        {/* Main Content - Full Width */}
        <div className="w-full space-y-6">
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
                    <div className='text-sm font-medium'>{templateData.instanceName}</div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs text-muted-foreground'>Instance Type</Label>
                    <div className='text-sm font-medium'>{instanceTypeDetails.name}</div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs text-muted-foreground'>Machine Image</Label>
                    <div className='text-sm font-medium'>{machineImageDetails.name}</div>
                  </div>
                </div>

                {/* Instance Scaling */}
                <div>
                  <Label className='text-sm font-medium mb-3 block'>Instance Scaling</Label>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='space-y-1'>
                      <Label className='text-xs text-muted-foreground'>Minimum Instances</Label>
                      <div className='text-sm font-medium'>1</div>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs text-muted-foreground'>Desired Instances</Label>
                      <div className='text-sm font-medium'>2</div>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs text-muted-foreground'>Maximum Instances</Label>
                      <div className='text-sm font-medium'>10</div>
                    </div>
                  </div>
                </div>

                {/* Storage Configuration */}
                <div>
                  <Label className='text-sm font-medium mb-3 block'>Storage Configuration</Label>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    <div className='space-y-1'>
                      <Label className='text-xs text-muted-foreground'>Bootable Volume Name</Label>
                      <div className='text-sm font-medium'>{templateData.bootVolumeName}</div>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs text-muted-foreground'>Bootable Volume Size</Label>
                      <div className='text-sm font-medium'>{templateData.bootVolumeSize} GB</div>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs text-muted-foreground'>Startup Script</Label>
                      <div className='text-sm font-medium'>Configured</div>
                    </div>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4'>
                    <div className='space-y-1'>
                      <Label className='text-xs text-muted-foreground'>Storage Volumes</Label>
                      <div className='text-sm font-medium'>{templateData.storageVolumes.length} volume(s) configured</div>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs text-muted-foreground'>SSH Key</Label>
                      <div className='text-sm font-medium'>{sshKeyDetails.name}</div>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs text-muted-foreground'>Tags</Label>
                      <div className='flex flex-wrap gap-1'>
                        {templateData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag.key}: {tag.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instance Specifications */}
                <div>
                  <Label className='text-sm font-medium mb-3 block'>Instance Specifications</Label>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    <div className='space-y-1'>
                      <Label className='text-xs text-muted-foreground'>vCPUs</Label>
                      <div className='text-sm font-medium'>{instanceTypeDetails.vcpus}</div>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs text-muted-foreground'>Memory</Label>
                      <div className='text-sm font-medium'>{instanceTypeDetails.ram} GB</div>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs text-muted-foreground'>Price</Label>
                      <div className='text-sm font-medium'>₹{instanceTypeDetails.pricePerHour}/hr</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                  <div className='text-sm font-medium'>US East (N. Virginia)</div>
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>VPC</Label>
                  <div className='text-sm font-medium'>{templateData.vpc}</div>
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>Subnet</Label>
                  <div className='text-sm font-medium'>{templateData.subnet}</div>
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>Security Groups</Label>
                  <div className='text-sm font-medium'>{securityGroupDetails.map(sg => sg?.name).join(', ')}</div>
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>Availability Zones</Label>
                  <div className='text-sm font-medium'>us-east-1a, us-east-1b</div>
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
                </div>
              </div>
            </div>
            <div className='px-6 pb-6'>
              <div className='space-y-4'>
                {templateData.scalingPolicies.map((policy, index) => (
                  <div key={policy.id} className='p-4 border rounded-lg'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        <h4 className='text-sm font-medium'>{policy.type}</h4>
                        <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30 bg-transparent">
                          {policy.type === 'CPU Utilization' ? 'CPU' : policy.type === 'Memory Utilization' ? 'Memory' : 'Scheduled'}
                        </Badge>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                      <div className='space-y-1'>
                        <Label className='text-xs text-muted-foreground'>Metric</Label>
                        <div className='text-sm font-medium'>{policy.metric}</div>
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs text-muted-foreground'>Threshold</Label>
                        <div className='text-sm font-medium'>{policy.threshold}</div>
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs text-muted-foreground'>Action</Label>
                        <div className='text-sm font-medium'>{policy.action}</div>
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs text-muted-foreground'>Cooldown</Label>
                        <div className='text-sm font-medium'>{policy.scaleOutCooldown || policy.scaleInCooldown}s</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        resourceName="cache-server-template"
        resourceType="Template"
      />
    </PageLayout>
  );
}