'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageLayout } from '@/components/page-layout';
import { DetailGrid } from '@/components/detail-grid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import {
  getRoleById,
  getPoliciesByRoleId,
  getGroupsByRoleId,
  getUsersByRoleId,
} from '@/lib/iam-data';
import { EditRoleModal } from '@/components/modals/edit-role-modal';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { useToast } from '@/hooks/use-toast';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default function RoleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roleId = params.roleId as string;
  const role = getRoleById(roleId);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  if (!role) {
    notFound();
  }

  const policies = getPoliciesByRoleId(roleId);
  const groups = getGroupsByRoleId(roleId);
  const users = getUsersByRoleId(roleId);

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    toast({
      title: 'Role updated',
      description: 'Role has been updated successfully.',
    });
    router.refresh();
  };

  const handleDeleteConfirm = () => {
    toast({
      title: 'Role deleted',
      description: `Role "${role.name}" has been deleted.`,
    });
    router.push('/iam/roles');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
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
        customBreadcrumbs={customBreadcrumbs}
        hideViewDocs={true}
      >
        {/* Role Basic Information - VPC Style */}
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
          {/* Overlay Edit/Delete Buttons - Only for custom roles */}
          {role.type === 'custom' && (
            <div className='absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setEditModalOpen(true)}
                className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
              >
                <Edit className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setDeleteModalOpen(true)}
                className='h-8 w-8 p-0 text-muted-foreground hover:text-red-600 bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          )}

          <DetailGrid>
            {/* Row 1: Created At, Policies, Type */}
            <div className='col-span-full grid grid-cols-3 gap-4'>
              <div className='space-y-1'>
                <label className='text-sm font-normal text-gray-700' style={{ fontSize: '13px' }}>
                  Created At
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {formatDate(role.createdAt)}
                </div>
              </div>
              <div className='space-y-1'>
                <label className='text-sm font-normal text-gray-700' style={{ fontSize: '13px' }}>
                  Policies
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {policies.length} {policies.length === 1 ? 'policy' : 'policies'}
                </div>
              </div>
              <div className='space-y-1'>
                <label className='text-sm font-normal text-gray-700' style={{ fontSize: '13px' }}>
                  Type
                </label>
                <div>
                  <Badge 
                    variant={role.type === 'default' ? 'secondary' : 'outline'}
                    className='text-xs capitalize'
                  >
                    {role.type}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className='col-span-full mt-4'>
              <div className='space-y-1'>
                <label className='text-sm font-normal text-gray-700' style={{ fontSize: '13px' }}>
                  Description
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {role.description || 'No description'}
                </div>
              </div>
            </div>
          </DetailGrid>
        </div>

        {/* Policies Section */}
        {policies.length > 0 && (
          <div className='bg-card text-card-foreground border-border border rounded-lg p-6 mb-6'>
            <h3 className='text-base font-semibold mb-4'>Policies ({policies.length})</h3>
            <div className='border rounded-md'>
              {policies.map((policy, index) => (
                <Link
                  key={policy.id}
                  href={`/iam/policies/${policy.id}`}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors ${
                    index !== policies.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className='flex-1 min-w-0'>
                    <div className='font-medium text-sm text-primary hover:underline'>
                      {policy.name}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {policy.description}
                    </div>
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {policy.rules.length} {policy.rules.length === 1 ? 'rule' : 'rules'}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Groups Using This Role */}
        {groups.length > 0 && (
          <div className='bg-card text-card-foreground border-border border rounded-lg p-6 mb-6'>
            <h3 className='text-base font-semibold mb-4'>Groups Using This Role ({groups.length})</h3>
            <div className='border rounded-md'>
              {groups.map((group, index) => (
                <Link
                  key={group.id}
                  href={`/iam/groups/${group.id}`}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors ${
                    index !== groups.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className='flex-1 min-w-0'>
                    <div className='font-medium text-sm text-primary hover:underline'>
                      {group.name}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {group.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Users With This Role */}
        {users.length > 0 && (
          <div className='bg-card text-card-foreground border-border border rounded-lg p-6'>
            <h3 className='text-base font-semibold mb-4'>Users With This Role ({users.length})</h3>
            <div className='border rounded-md'>
              {users.map((user, index) => (
                <Link
                  key={user.id}
                  href={`/iam/users/${user.id}`}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors ${
                    index !== users.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className='flex-1 min-w-0'>
                    <div className='font-medium text-sm text-primary hover:underline'>
                      {user.name}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {user.email}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </PageLayout>

      <EditRoleModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        role={role}
        onSuccess={handleEditSuccess}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        resourceName={role.name}
        resourceType='Role'
      />
    </>
  );
}
