'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageLayout } from '@/components/page-layout';
import { DetailSection } from '@/components/detail-section';
import { DetailGrid } from '@/components/detail-grid';
import { DetailItem } from '@/components/detail-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield } from 'lucide-react';
import {
  getGroupById,
  getRolesByGroupId,
  type Group,
  canDeleteGroup,
} from '@/lib/iam-data';
import { EditGroupModal } from '@/components/modals/edit-group-modal';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { useToast } from '@/hooks/use-toast';
import { notFound } from 'next/navigation';

export default function GroupDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const groupId = params.groupId as string;
  const group = getGroupById(groupId);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  if (!group) {
    notFound();
  }

  const roles = getRolesByGroupId(groupId);

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    toast({
      title: 'Group updated successfully',
      description: 'The group has been updated.',
    });
    router.refresh();
  };

  const handleDeleteClick = () => {
    const validation = canDeleteGroup(groupId);
    if (!validation.canDelete) {
      toast({
        title: 'Cannot delete group',
        description: validation.reason,
        variant: 'destructive',
      });
      return;
    }
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    toast({
      title: 'Group deleted',
      description: `Group "${group.name}" has been deleted.`,
    });
    router.push('/iam/groups');
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
    { href: '/iam/groups', title: 'Groups' },
    { href: `/iam/groups/${groupId}`, title: group.name },
  ];

  return (
    <>
      <PageLayout
        title={group.name}
        description={group.description || 'Group details and attached roles'}
        customBreadcrumbs={customBreadcrumbs}
        headerActions={
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={() => setEditModalOpen(true)}
              size='sm'
            >
              Edit Group
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteClick}
              size='sm'
            >
              Delete Group
            </Button>
          </div>
        }
      >
        <div className='space-y-6'>
          {/* Group Information */}
          <DetailSection title='Group Information'>
            <DetailGrid>
              <DetailItem label='Name' value={group.name} />
              <DetailItem
                label='Description'
                value={group.description || 'N/A'}
              />
              <DetailItem
                label='Created At'
                value={formatDate(group.createdAt)}
              />
              <DetailItem
                label='Attached Roles'
                value={`${roles.length} role${roles.length !== 1 ? 's' : ''}`}
              />
            </DetailGrid>
          </DetailSection>

          {/* Attached Roles */}
          <DetailSection title='Attached Roles'>
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
                    No roles attached to this group
                  </p>
                </CardContent>
              </Card>
            )}
          </DetailSection>
        </div>
      </PageLayout>

      <EditGroupModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        group={group}
        onSuccess={handleEditSuccess}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        resourceName={group.name}
        resourceType='Group'
      />
    </>
  );
}

