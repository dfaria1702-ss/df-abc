'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { ShadcnDataTable, type Column } from '@/components/ui/shadcn-data-table';
import { ActionMenu } from '@/components/action-menu';
import { Badge } from '@/components/ui/badge';
import { Users2 } from 'lucide-react';
import { mockUsers, type User, getUserById, getRolesByUserId, getGroupsByUserId } from '@/lib/iam-data';
import { StatusBadge } from '@/components/status-badge';
import { InviteUserModal } from '@/components/modals/invite-user-modal';
import { EditUserAccessModal } from '@/components/modals/edit-user-access-modal';
import { ResendInviteModal } from '@/components/modals/resend-invite-modal';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resendInviteModalOpen, setResendInviteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState(mockUsers);

  const handleInviteSuccess = () => {
    setInviteModalOpen(false);
    toast({
      title: 'User invited successfully',
      description: 'An invitation email has been sent to the user.',
    });
    // In a real app, this would refresh the user list
  };

  const handleEditAccess = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
    toast({
      title: 'User access updated',
      description: 'User roles and groups have been updated successfully.',
    });
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleResendInvite = (user: User) => {
    setSelectedUser(user);
    setResendInviteModalOpen(true);
  };

  const handleResendInviteSuccess = () => {
    setResendInviteModalOpen(false);
    if (selectedUser) {
      toast({
        title: 'Invitation resent',
        description: `Invitation email has been resent to ${selectedUser.email}.`,
      });
    }
  };

  const handleBlockUser = (user: User) => {
    setUsers(
      users.map(u =>
        u.id === user.id
          ? { ...u, status: u.status === 'blocked' ? 'active' : 'blocked' }
          : u
      )
    );
    toast({
      title: user.status === 'blocked' ? 'User unblocked' : 'User blocked',
      description: `User "${user.name}" has been ${
        user.status === 'blocked' ? 'unblocked' : 'blocked'
      }.`,
    });
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setDeleteModalOpen(false);
      setSelectedUser(null);
      toast({
        title: 'User deleted',
        description: `User "${selectedUser.name}" has been removed from the organization.`,
      });
    }
  };

  const handleViewUser = (user: User) => {
    router.push(`/iam/users/${user.id}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
      case 'blocked':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      searchable: true,
      render: (value: string, row: User) => (
        <div className='flex items-center gap-2'>
          <div
            className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium'
          >
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className='font-medium text-sm'>{row.name}</div>
            <div className='text-xs text-muted-foreground'>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      searchable: true,
      render: (value: string) => (
        <div className='text-sm'>{value}</div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: User['status']) => (
        <StatusBadge status={getStatusVariant(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </StatusBadge>
      ),
    },
    {
      key: 'roles',
      label: 'Roles',
      render: (_: unknown, row: User) => {
        const roles = getRolesByUserId(row.id);
        if (roles.length === 0) {
          return <span className='text-sm text-muted-foreground'>No roles</span>;
        }
        return (
          <div className='flex flex-wrap gap-1'>
            {roles.slice(0, 2).map(role => (
              <Badge key={role.id} variant='secondary' className='text-xs'>
                {role.name}
              </Badge>
            ))}
            {roles.length > 2 && (
              <Badge variant='secondary' className='text-xs'>
                +{roles.length - 2} more
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'groups',
      label: 'Groups',
      render: (_: unknown, row: User) => {
        const groups = getGroupsByUserId(row.id);
        if (groups.length === 0) {
          return <span className='text-sm text-muted-foreground'>No groups</span>;
        }
        return (
          <div className='flex flex-wrap gap-1'>
            {groups.slice(0, 2).map(group => (
              <Badge key={group.id} variant='outline' className='text-xs'>
                {group.name}
              </Badge>
            ))}
            {groups.length > 2 && (
              <Badge variant='outline' className='text-xs'>
                +{groups.length - 2} more
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (_: unknown, row: User) => (
        <div className='flex justify-end'>
          <ActionMenu
            viewHref={`/iam/users/${row.id}`}
            onEdit={() => handleEditAccess(row)}
            onDelete={() => handleDeleteClick(row)}
            resourceName={row.name}
            resourceType='User'
            customActions={[
              ...(row.status === 'invited' || row.status === 'pending'
                ? [
                    {
                      label: 'Resend Invite',
                      onClick: () => handleResendInvite(row),
                      icon: null,
                    },
                  ]
                : []),
              {
                label: row.status === 'blocked' ? 'Unblock User' : 'Block User',
                onClick: () => handleBlockUser(row),
                icon: null,
                variant: row.status === 'blocked' ? 'default' : 'destructive',
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageShell
        title='Users'
        description='Manage user accounts and their access permissions'
        headerActions={
          <Button
            onClick={() => setInviteModalOpen(true)}
            className='bg-black text-white rounded-full px-6 py-2 text-base font-medium hover:bg-neutral-800'
          >
            Invite User
          </Button>
        }
      >
        <ShadcnDataTable
          columns={columns}
          data={users}
          searchableColumns={['name', 'email']}
          defaultSort={{ column: 'name', direction: 'asc' }}
          pageSize={10}
          enableSearch={true}
          enablePagination={true}
          searchPlaceholder='Search users by name or email...'
        />
      </PageShell>

      <InviteUserModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        onSuccess={handleInviteSuccess}
      />

      {selectedUser && (
        <>
          <EditUserAccessModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            user={selectedUser}
            onSuccess={handleEditSuccess}
          />

          <ResendInviteModal
            open={resendInviteModalOpen}
            onOpenChange={setResendInviteModalOpen}
            user={selectedUser}
            onSuccess={handleResendInviteSuccess}
          />

          <DeleteConfirmationModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedUser(null);
            }}
            onConfirm={handleDeleteConfirm}
            resourceName={selectedUser.name}
            resourceType='User'
          />
        </>
      )}
    </>
  );
}
