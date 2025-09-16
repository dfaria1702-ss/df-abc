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
  History,
} from 'lucide-react';
import { PageLayout } from '@/components/page-layout';
import { DetailGrid } from '@/components/detail-grid';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function TemplateDetailsPage() {
  const { id } = useParams();
  const { toast } = useToast();

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

  // Mock data for sections based on template structure
  const templateSpecifications = {
    name: template.name,
    type: template.type,
    flavour: template.flavour,
    version: template.version,
    imageId: template.imageId,
    keyName: template.keyName,
    iamInstanceProfile: template.iamInstanceProfile || 'None',
    monitoring: template.monitoring,
  };

  const securityConfiguration = {
    securityGroups: template.securityGroups,
    keyName: template.keyName,
    iamRole: template.iamInstanceProfile || 'None',
  };

  const userDataScripts = [
    {
      name: 'User Data Script',
      type: 'Shell Script',
      content: template.userData || 'No user data configured',
      size: template.userData ? `${Math.ceil(template.userData.length / 1024)} KB` : '0 KB'
    }
  ];

  const versionHistory = [
    {
      version: template.version,
      date: template.lastModified,
      status: 'Current',
      changes: 'Latest version',
      isLatest: template.isLatest
    },
    {
      version: template.version - 1,
      date: '2024-01-20T15:30:00Z',
      status: 'Previous',
      changes: 'Updated security groups',
      isLatest: false
    },
    {
      version: template.version - 2,
      date: '2024-01-15T10:20:00Z',
      status: 'Previous',
      changes: 'Initial template creation',
      isLatest: false
    }
  ];

  // Action handlers
  const handleEdit = () => {
    toast({
      title: 'Edit Template',
      description: `Editing ${template.name}...`,
    });
  };

  const handleDelete = () => {
    toast({
      title: 'Delete Template',
      description: `Deleting ${template.name}...`,
    });
  };

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
            {/* Template Name, Type, Version, Status in one row */}
            <div className='col-span-full grid grid-cols-4 gap-4'>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Template Name
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {template.name}
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
                  <Badge variant='secondary'>{template.type}</Badge>
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Version
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  v{template.version}
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
                  <Badge 
                    variant='secondary'
                    className={`text-xs h-5 cursor-default ${
                      template.isLatest
                        ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800'
                        : 'hover:bg-secondary hover:text-secondary-foreground'
                    }`}
                  >
                    {template.isLatest ? 'Latest' : 'Previous'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Flavour, Image ID, Created On, Last Modified in second row */}
            <div className='col-span-full grid grid-cols-4 gap-4 mt-4'>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Flavour
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {template.flavour}
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Image ID
                </label>
                <div className='font-medium font-mono' style={{ fontSize: '14px' }}>
                  {template.imageId}
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
                  {formatDate(template.createdOn)}
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Last Modified
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {formatDate(template.lastModified)}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className='col-span-full mt-4'>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Description
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {template.description}
                </div>
              </div>
            </div>
          </DetailGrid>
        </div>

        {/* Template Specifications */}
        <div className='bg-card text-card-foreground border-border border rounded-lg'>
          <div className='p-6 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <h3 className='text-lg font-semibold'>Template Specifications</h3>
              </div>
            </div>
          </div>
          <div className='px-6 pb-6'>
            <div
              className='border transition-colors rounded-lg bg-card p-4 relative border-border hover:border-gray-300'
            >
              {/* Header with template name and type tag */}
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-2 flex-1 min-w-0'>
                  <h4 className='text-sm font-medium leading-none'>
                    {templateSpecifications.name}
                  </h4>
                  <Badge variant='secondary' className='text-xs h-5'>
                    {templateSpecifications.type}
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
                      {templateSpecifications.flavour}
                    </span>
                  </div>
                </div>

                {/* Version, Image ID, Key Name in same row */}
                <div className='grid grid-cols-3 gap-6'>
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      Version
                    </Label>
                    <div className='mt-1'>
                      <span className='text-sm font-medium'>
                        v{templateSpecifications.version}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      Image ID
                    </Label>
                    <div className='mt-1'>
                      <span className='text-sm font-mono'>
                        {templateSpecifications.imageId}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      Key Name
                    </Label>
                    <div className='mt-1'>
                      <span className='text-sm'>
                        {templateSpecifications.keyName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* IAM Profile and Monitoring in same row */}
                <div className='grid grid-cols-3 gap-6'>
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      IAM Instance Profile
                    </Label>
                    <div className='mt-1'>
                      <span className='text-sm'>{templateSpecifications.iamInstanceProfile}</span>
                    </div>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      Monitoring
                    </Label>
                    <div className='mt-1'>
                      <Badge 
                        variant='secondary'
                        className={`text-xs h-5 cursor-default ${
                          templateSpecifications.monitoring
                            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800'
                            : 'hover:bg-secondary hover:text-secondary-foreground'
                        }`}
                      >
                        {templateSpecifications.monitoring ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                  <div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Configuration */}
        <div className='bg-card text-card-foreground border-border border rounded-lg'>
          <div className='p-6 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <h3 className='text-lg font-semibold'>Security Configuration</h3>
                <div className='bg-gray-800 text-white text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center'>
                  {securityConfiguration.securityGroups.length}
                </div>
              </div>
            </div>
          </div>
          <div className='px-6 pb-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {securityConfiguration.securityGroups.map((sg, index) => (
                <div
                  key={index}
                  className='border transition-colors rounded-lg bg-card p-4 relative border-border hover:border-gray-300'
                >
                  {/* Header with security group name */}
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-sm font-medium leading-none'>
                        {sg}
                      </h4>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className='space-y-3 text-xs'>
                    <div className='grid grid-cols-2 gap-6'>
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Type
                        </Label>
                        <div className='mt-1'>
                          <span className='text-sm'>Security Group</span>
                        </div>
                      </div>
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Status
                        </Label>
                        <div className='mt-1'>
                          <Badge 
                            variant='secondary'
                            className='text-xs h-5 cursor-default bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800'
                          >
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Data and Scripts */}
        <div className='bg-card text-card-foreground border-border border rounded-lg'>
          <div className='p-6 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <h3 className='text-lg font-semibold'>User Data and Scripts</h3>
                <div className='bg-gray-800 text-white text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center'>
                  {userDataScripts.length}
                </div>
              </div>
            </div>
          </div>
          <div className='px-6 pb-6'>
            <div className='space-y-4'>
              {userDataScripts.map((script, index) => (
                <div
                  key={index}
                  className='border transition-colors rounded-lg bg-card p-4 relative border-border hover:border-gray-300'
                >
                  {/* Header with script name */}
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center gap-2 flex-1 min-w-0'>
                      <h4 className='text-sm font-medium leading-none'>
                        {script.name}
                      </h4>
                      <Badge variant='secondary' className='text-xs h-5'>
                        {script.type}
                      </Badge>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className='space-y-3 text-xs'>
                    {/* Script content */}
                    <div>
                      <Label className='text-xs text-muted-foreground'>
                        Script Content
                      </Label>
                      <div className='mt-1'>
                        <div className='bg-muted/50 p-3 rounded-lg'>
                          <code className='text-sm font-mono break-all whitespace-pre-wrap'>
                            {script.content}
                          </code>
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-3 gap-6'>
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Size
                        </Label>
                        <div className='mt-1'>
                          <span className='text-sm'>{script.size}</span>
                        </div>
                      </div>
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Type
                        </Label>
                        <div className='mt-1'>
                          <span className='text-sm'>{script.type}</span>
                        </div>
                      </div>
                      <div></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Version History */}
        <div className='bg-card text-card-foreground border-border border rounded-lg'>
          <div className='p-6 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <h3 className='text-lg font-semibold'>Version History</h3>
                <div className='bg-gray-800 text-white text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center'>
                  {versionHistory.length}
                </div>
              </div>
            </div>
          </div>
          <div className='px-6 pb-6'>
            <div className='space-y-4'>
              {versionHistory.map((version, index) => (
                <div
                  key={index}
                  className='border transition-colors rounded-lg bg-card p-4 relative border-border hover:border-gray-300'
                >
                  {/* Header with version and status */}
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center gap-2 flex-1 min-w-0'>
                      <h4 className='text-sm font-medium leading-none'>
                        Version {version.version}
                      </h4>
                      <Badge 
                        variant='secondary'
                        className={`text-xs h-5 cursor-default ${
                          version.isLatest
                            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800'
                            : 'hover:bg-secondary hover:text-secondary-foreground'
                        }`}
                      >
                        {version.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className='space-y-3 text-xs'>
                    <div className='grid grid-cols-3 gap-6'>
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Date
                        </Label>
                        <div className='mt-1'>
                          <span className='text-sm'>{formatDate(version.date)}</span>
                        </div>
                      </div>
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Changes
                        </Label>
                        <div className='mt-1'>
                          <span className='text-sm'>{version.changes}</span>
                        </div>
                      </div>
                      <div></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
