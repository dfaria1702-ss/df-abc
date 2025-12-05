'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/page-layout';
import { DetailSection } from '@/components/detail-section';
import { DetailGrid } from '@/components/detail-grid';
import { DetailItem } from '@/components/detail-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import {
  getRoleById,
  getPoliciesByRoleId,
  type Role,
} from '@/lib/iam-data';
import { EditRoleModal } from '@/components/modals/edit-role-modal';
import { useToast } from '@/hooks/use-toast';
import { notFound } from 'next/navigation';

export default function RoleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roleId = params.roleId as string;
  const role = getRoleById(roleId);
  const [editModalOpen, setEditModalOpen] = useState(false);

  if (!role) {
    notFound();
  }

  const policies = getPoliciesByRoleId(roleId);

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    toast({
      title: 'Role updated successfully',
      description: 'The role has been updated.',
    });
    router.refresh();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const customBreadcrumbs = [
    { href: '/dashboard', title: 'Home' },
    { href: '/iam', title: 'IAM' },
    { href: '/iam/roles', title: 'Roles' },
    { href: `/iam/roles/${roleId}`, title: role.name },
  ];

  return (
    <>
      <PageLayout
        title={role.name}
        description={role.description || 'Role details and attached policies'}
        customBreadcrumbs={customBreadcrumbs}
        headerActions={
          <Button
            variant='outline'
            onClick={() => setEditModalOpen(true)}
            size='sm'
          >
            Edit Role
          </Button>
        }
      >
      <div className='space-y-6'>
        {/* Role Information */}
        <DetailSection title='Role Information'>
          <DetailGrid>
            <DetailItem label='Name' value={role.name} />
            <DetailItem
              label='Description'
              value={role.description || 'N/A'}
            />
            <DetailItem
              label='Created At'
              value={formatDate(role.createdAt)}
            />
            <DetailItem
              label='Attached Policies'
              value={`${policies.length} polic${policies.length !== 1 ? 'ies' : 'y'}`}
            />
          </DetailGrid>
        </DetailSection>

        {/* Attached Policies */}
        <DetailSection title='Attached Policies'>
          {policies.length > 0 ? (
            <div className='grid gap-4 md:grid-cols-2'>
              {policies.map(policy => (
                <Card key={policy.id}>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-base font-medium'>
                        {policy.name}
                      </CardTitle>
                      <Shield className='h-4 w-4 text-muted-foreground' />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-muted-foreground'>
                      {policy.description}
                    </p>
                    <div className='mt-4 flex items-center gap-2 text-xs text-muted-foreground'>
                      <span>
                        {policy.rules.length} rule
                        {policy.rules.length !== 1 ? 's' : ''}
                      </span>
                      <span>•</span>
                      <span>
                        Created {new Date(policy.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className='py-8 text-center'>
                <Shield className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <p className='text-sm text-muted-foreground'>
                  No policies attached to this role
                </p>
              </CardContent>
            </Card>
          )}
        </DetailSection>
      </div>
    </PageLayout>

    <EditRoleModal
      open={editModalOpen}
      onOpenChange={setEditModalOpen}
      role={role}
      onSuccess={handleEditSuccess}
    />
    </>
  );
}

