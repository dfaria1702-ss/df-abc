'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { autoScalingTemplates } from '@/lib/data';
import {
  Edit,
  Trash2,
  Activity,
  Shield,
  FileText,
} from 'lucide-react';
import { PageLayout } from '@/components/page-layout';
import { DetailGrid } from '@/components/detail-grid';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';

// Mock data to match Create Template structure
const instanceTypes = [
  { id: "cpu-1x-4gb", name: "CPU-1x-4GB", vcpus: 1, ram: 4, pricePerHour: 3 },
  { id: "cpu-2x-8gb", name: "CPU-2x-8GB", vcpus: 2, ram: 8, pricePerHour: 6 },
  { id: "cpu-4x-16gb", name: "CPU-4x-16GB", vcpus: 4, ram: 16, pricePerHour: 13 },
  { id: "cpu-8x-32gb", name: "CPU-8x-32GB", vcpus: 8, ram: 32, pricePerHour: 25 },
  { id: "cpu-16x-64gb", name: "CPU-16x-64GB", vcpus: 16, ram: 64, pricePerHour: 49 },
  { id: "cpu-32x-128gb", name: "CPU-32x-128GB", vcpus: 32, ram: 128, pricePerHour: 97 }
]

const machineImages = [
  { id: "ami-ubuntu-20.04", name: "Ubuntu 20.04 LTS", description: "Latest Ubuntu 20.04 LTS" },
  { id: "ami-ubuntu-22.04", name: "Ubuntu 22.04 LTS", description: "Latest Ubuntu 22.04 LTS" },
  { id: "ami-centos-7", name: "CentOS 7", description: "Latest CentOS 7" },
  { id: "ami-centos-8", name: "CentOS 8", description: "Latest CentOS 8" },
  { id: "ami-rhel-7", name: "Red Hat Enterprise Linux 7", description: "Latest RHEL 7" },
  { id: "ami-rhel-8", name: "Red Hat Enterprise Linux 8", description: "Latest RHEL 8" },
]

const sshKeys = [
  { id: "ssh-key-1", name: "my-key-pair" },
  { id: "ssh-key-2", name: "production-key" },
  { id: "ssh-key-3", name: "development-key" },
]

const mockSecurityGroups = [
  { id: "sg-default", name: "default", description: "Default security group" },
  { id: "sg-web", name: "web-servers", description: "Security group for web servers" },
  { id: "sg-db", name: "database", description: "Security group for database servers" },
  { id: "sg-app", name: "application", description: "Security group for application servers" },
  { id: "sg-cache", name: "cache-servers", description: "Security group for cache servers" }
]

export default function TemplateDetailsPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const template = autoScalingTemplates.find(t => t.id === id);

  if (!template) {
    return (
      <div className='p-8 text-center text-gray-500'>
        Template not found
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
    { href: `/compute/auto-scaling/templates/${template.id}`, title: template.name },
  ];

  // Mock template data to match Create Template structure
  const templateData = {
    // Template Name
    templateName: template.name,
    
    // Instance Configuration
    instanceName: template.name + "-instance",
    instanceType: template.flavour || "cpu-4x-16gb",
    
    // Storage Configuration
    bootVolumeName: template.name + "-boot",
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
      { key: "Template", value: template.name },
      { key: "Version", value: template.version.toString() }
    ],
    
    // Network Configuration
    region: "us-east-1",
    vpc: "vpc-1",
    subnet: "subnet-1",
    securityGroups: ["sg-default", "sg-web"],
    
    // Auto Scaling Policies
    scalingPolicies: [
      {
        id: "policy-1",
        type: "Average CPU Utilization",
        upScaleTarget: 70,
        downScaleTarget: 40,
        scaleOutCooldown: 180,
        scaleInCooldown: 300
      },
      {
        id: "policy-2",
        type: "Average Memory Utilization",
        upScaleTarget: 80,
        downScaleTarget: 50,
        scaleOutCooldown: 240,
        scaleInCooldown: 360
      }
    ]
  };

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
      description: `${template.name} has been deleted successfully.`,
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
      title={template.name}
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
          {/* Overlay Edit/Delete Buttons */}
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

          <DetailGrid>
            {/* Template Name, Type, Flavour, Version, Created On in one row */}
            <div className='col-span-full grid grid-cols-5 gap-4'>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Template Name
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  cache-server-template
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
                  CPU
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
                  t3.medium
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Version
                </label>
                <div className='flex items-center gap-2'>
                  <Badge variant="secondary" className='bg-black text-white text-xs px-2 py-1'>
                    V6
                  </Badge>
                  <span className='text-xs text-gray-500'>Latest Version</span>
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

        {/* Main Content - Individual Cards */}
        <div className="space-y-6">
          {/* Instance Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Instance Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Instance Name</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm">{templateData.instanceName}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Instance Type</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-sm">{instanceTypeDetails.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {instanceTypeDetails.vcpus} vCPU • {instanceTypeDetails.ram} GB RAM
                        </span>
                      </div>
                      <span className="text-primary font-semibold text-xs">
                        ₹{instanceTypeDetails.pricePerHour}/hr
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Storage Configuration</CardTitle>
            </CardHeader>
            <CardContent>
                  
                  {/* Bootable Volume */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">Bootable Volume</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Volume Name</Label>
                        <div className="p-2 bg-gray-50 rounded border text-sm">
                          {templateData.bootVolumeName}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Size (GB)</Label>
                        <div className="p-2 bg-gray-50 rounded border text-sm">
                          {templateData.bootVolumeSize} GB
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Machine Image</Label>
                        <div className="p-2 bg-gray-50 rounded border text-sm">
                          {machineImageDetails.name}
                        </div>
                      </div>
                    </div>
                  </div>

              {/* Additional Storage Volumes */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Additional Storage Volumes</Label>
                {templateData.storageVolumes.map((volume, index) => (
                  <div key={volume.id} className="p-4 border rounded-lg bg-gray-50/50">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Volume Name</Label>
                        <div className="text-sm font-medium">{volume.name}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Size (GB)</Label>
                        <div className="text-sm">{volume.size} GB</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Type</Label>
                        <div className="text-sm">{volume.type}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scripts & Tags Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Scripts & Tags</CardTitle>
            </CardHeader>
            <CardContent>
                  
                  {/* SSH Key */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">SSH Key</Label>
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <span className="text-sm">{sshKeyDetails.name}</span>
                    </div>
                  </div>

                  {/* Startup Script */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Startup Script</Label>
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                        {templateData.startupScript}
                      </pre>
                    </div>
                  </div>

              {/* Tags */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Tags</Label>
                <div className="space-y-2">
                  {templateData.tags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded border">
                      <div className="flex-1">
                        <span className="text-sm font-medium">{tag.key}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-muted-foreground">{tag.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Network Configuration</CardTitle>
            </CardHeader>
            <CardContent>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Region</Label>
                      <div className="p-3 bg-gray-50 rounded-md border">
                        <span className="text-sm">US East (N. Virginia)</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">VPC</Label>
                      <div className="p-3 bg-gray-50 rounded-md border">
                        <span className="text-sm">Default VPC (us-east-1)</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Subnet</Label>
                      <div className="p-3 bg-gray-50 rounded-md border">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Public Subnet</span>
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            Public
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Security Groups</Label>
                      <div className="space-y-2">
                        {securityGroupDetails.map((sg) => (
                          <div key={sg?.id} className="p-2 bg-gray-50 rounded border">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{sg?.name}</span>
                              <span className="text-xs text-muted-foreground">{sg?.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto Scaling Policies Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Auto Scaling Policies</CardTitle>
            </CardHeader>
            <CardContent>
                  
                  <div className="space-y-4">
                    {templateData.scalingPolicies.map((policy, index) => (
                      <div key={policy.id} className="p-4 border rounded-lg bg-gray-50/50">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className="bg-gray-100 text-gray-800 font-medium"
                            >
                              {policy.type === "Average CPU Utilization" ? "CPU" : 
                               policy.type === "Average Memory Utilization" ? "Memory" : "Scheduled"}
                            </Badge>
                            <span className="text-sm font-medium">{policy.type}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Up Scale Target</Label>
                              <div className="text-sm font-medium">{policy.upScaleTarget}%</div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Down Scale Target</Label>
                              <div className="text-sm font-medium">{policy.downScaleTarget}%</div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Scale Out Cooldown</Label>
                              <div className="text-sm">{policy.scaleOutCooldown}s</div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Scale In Cooldown</Label>
                              <div className="text-sm">{policy.scaleInCooldown}s</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        resourceName={template.name}
        resourceType="Template"
      />
    </PageLayout>
  );
}