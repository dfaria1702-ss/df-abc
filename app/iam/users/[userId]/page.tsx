'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageLayout } from '@/components/page-layout';
import { DetailSection } from '@/components/detail-section';
import { DetailGrid } from '@/components/detail-grid';
import { DetailItem } from '@/components/detail-item';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users } from 'lucide-react';
import {
  getUserById,
  getRolesByUserId,
  getGroupsByUserId,
  type User,
} from '@/lib/iam-data';
import { EditUserAccessModal } from '@/components/modals/edit-user-access-modal';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { useToast } from '@/hooks/use-toast';
import { notFound } from 'next/navigation';

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const userId = params.userId as string;
  const user = getUserById(userId);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  if (!user) {
    notFound();
  }

  const roles = getRolesByUserId(userId);
  const groups = getGroupsByUserId(userId);

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    toast({
      title: 'User access updated',
      description: 'User roles and groups have been updated successfully.',
    });
    // In a real app, this would refresh the page data
    router.refresh();
  };

  const handleDeleteConfirm = () => {
    toast({
      title: 'User deleted',
      description: `User "${user.name}" has been removed from the organization.`,
    });
    router.push('/iam/users');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusVariant = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'invited':
        return 'warning';
      case 'pending':
        return 'info';
      case 'suspended':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const customBreadcrumbs = [
    { href: '/dashboard', title: 'Home' },
    { href: '/iam', title: 'IAM' },
    { href: '/iam/users', title: 'Users' },
    { href: `/iam/users/${userId}`, title: user.name },
  ];

  return (
    <>
      <PageLayout
        title={user.name}
        description={`User details and access management for ${user.email}`}
        customBreadcrumbs={customBreadcrumbs}
        headerActions={
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={() => setEditModalOpen(true)}
              size='sm'
            >
              Edit Access
            </Button>
            <Button
              variant='destructive'
              onClick={() => setDeleteModalOpen(true)}
              size='sm'
            >
              Delete User
            </Button>
          </div>
        }
      >
        <div className='space-y-6'>
          {/* User Information */}
          <DetailSection title='User Information'>
            <DetailGrid>
              <DetailItem label='Name' value={user.name} />
              <DetailItem label='Email' value={user.email} />
              <DetailItem
                label='Status'
                value={
                  <StatusBadge status={getStatusVariant(user.status)}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </StatusBadge>
                }
              />
              <DetailItem
                label='Access Type'
                value={
                  <div className='flex gap-2'>
                    {user.accessType === 'both' || user.accessType === 'console' ? (
                      <Badge variant='secondary'>Console</Badge>
                    ) : null}
                    {user.accessType === 'both' || user.accessType === 'programmatic' ? (
                      <Badge variant='secondary'>Programmatic</Badge>
                    ) : null}
                  </div>
                }
              />
              <DetailItem
                label='Invited At'
                value={formatDate(user.invitedAt)}
              />
              <DetailItem
                label='Activated At'
                value={formatDate(user.activatedAt)}
              />
              <DetailItem
                label='Last Active'
                value={formatDate(user.lastActiveAt)}
              />
            </DetailGrid>
          </DetailSection>

          {/* Roles */}
          <DetailSection title='Roles'>
            {roles.length > 0 ? (
              <div className='grid gap-4 md:grid-cols-2'>
                {roles.map(role => (
                  <Card key={role.id}>
                    <CardHeader>
                      <div className='flex items-center justify-between'>
                        <CardTitle className='text-base font-medium'>
                          {role.name}
                        </CardTitle>
                        <Shield className='h-4 w-4 text-muted-foreground' />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm text-muted-foreground'>
                        {role.description}
                      </p>
                      <div className='mt-4 flex items-center gap-2 text-xs text-muted-foreground'>
                        <span>
                          {role.policyIds.length} polic
                          {role.policyIds.length !== 1 ? 'ies' : 'y'}
                        </span>
                        <span>•</span>
                        <span>
                          Created {new Date(role.createdAt).toLocaleDateString()}
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
                    No roles assigned to this user
                  </p>
                </CardContent>
              </Card>
            )}
          </DetailSection>

          {/* Groups */}
          <DetailSection title='Groups'>
            {groups.length > 0 ? (
              <div className='grid gap-4 md:grid-cols-2'>
                {groups.map(group => (
                  <Card key={group.id}>
                    <CardHeader>
                      <div className='flex items-center justify-between'>
                        <CardTitle className='text-base font-medium'>
                          {group.name}
                        </CardTitle>
                        <Users className='h-4 w-4 text-muted-foreground' />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm text-muted-foreground'>
                        {group.description}
                      </p>
                      <div className='mt-4 flex items-center gap-2 text-xs text-muted-foreground'>
                        <span>
                          {group.roleIds.length} role
                          {group.roleIds.length !== 1 ? 's' : ''}
                        </span>
                        <span>•</span>
                        <span>
                          Created {new Date(group.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className='py-8 text-center'>
                  <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                  <p className='text-sm text-muted-foreground'>
                    No groups assigned to this user
                  </p>
                </CardContent>
              </Card>
            )}
          </DetailSection>
        </div>
      </PageLayout>

      <EditUserAccessModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        user={user}
        onSuccess={handleEditSuccess}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        resourceName={user.name}
        resourceType='User'
      />
    </>
  );
}

