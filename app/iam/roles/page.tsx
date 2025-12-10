'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { ShadcnDataTable, type Column } from '@/components/ui/shadcn-data-table';
import { ActionMenu } from '@/components/action-menu';
import {
  mockRoles,
  type Role,
  getRoleById,
  canDeleteRole,
} from '@/lib/iam-data';
import { CreateRoleModal } from '@/components/modals/create-role-modal';
import { EditRoleModal } from '@/components/modals/edit-role-modal';
import { DetachRoleModal } from '@/components/modals/detach-role-modal';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { useToast } from '@/hooks/use-toast';

export default function RolesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detachModalOpen, setDetachModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roles, setRoles] = useState(mockRoles);

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    toast({
      title: 'Role created successfully',
      description: 'The new role has been created.',
    });
  };

  const handleEditClick = (role: Role) => {
    setSelectedRole(role);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setSelectedRole(null);
    toast({
      title: 'Role updated successfully',
      description: 'The role has been updated.',
    });
  };

  const handleDeleteClick = (role: Role) => {
    const validation = canDeleteRole(role.id);
    if (!validation.canDelete) {
      // Show detachment modal instead
      setSelectedRole(role);
      setDetachModalOpen(true);
      return;
    }
    setSelectedRole(role);
    setDeleteModalOpen(true);
  };

  const handleDetach = (detachedGroupIds: string[], detachedUserIds: string[]) => {
    if (selectedRole) {
      toast({
        title: 'Role detached',
        description: `Role has been detached from ${detachedGroupIds.length} group(s) and ${detachedUserIds.length} user(s).`,
      });
      // After detachment, try deletion again
      const validation = canDeleteRole(selectedRole.id);
      if (validation.canDelete) {
        setDetachModalOpen(false);
        setDeleteModalOpen(true);
      } else {
        setDetachModalOpen(false);
        toast({
          title: 'Still has dependencies',
          description: validation.reason,
          variant: 'destructive',
        });
      }
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedRole) {
      setRoles(roles.filter(r => r.id !== selectedRole.id));
      setDeleteModalOpen(false);
      setSelectedRole(null);
      toast({
        title: 'Role deleted',
        description: `Role "${selectedRole.name}" has been deleted.`,
      });
    }
  };

  const handleViewRole = (role: Role) => {
    router.push(`/iam/roles/${role.id}`);
  };

  const columns: Column<Role>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      searchable: true,
      render: (value: string, row: Role) => (
        <div>
          <div
            className='font-medium text-sm cursor-pointer hover:text-primary'
            onClick={() => handleViewRole(row)}
          >
            {value}
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      render: (value: string) => (
        <div className='text-sm text-muted-foreground'>{value || 'N/A'}</div>
      ),
    },
    {
      key: 'policyIds',
      label: 'Policies',
      render: (_: unknown, row: Role) => (
        <div className='text-sm'>
          {row.policyIds.length} polic{row.policyIds.length !== 1 ? 'ies' : 'y'}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => (
        <div className='text-sm'>
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (_: unknown, row: Role) => (
        <div className='flex justify-end'>
          <ActionMenu
            viewHref={`/iam/roles/${row.id}`}
            onEdit={() => handleEditClick(row)}
            onCustomDelete={() => handleDeleteClick(row)}
            resourceName={row.name}
            resourceType='Role'
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageShell
        title='Roles'
        description='Define reusable permission sets for specific job functions'
        headerActions={
          <Button
            onClick={() => setCreateModalOpen(true)}
            className='bg-black text-white rounded-full px-6 py-2 text-base font-medium hover:bg-neutral-800'
          >
            Create Role
          </Button>
        }
      >
        <ShadcnDataTable
          columns={columns}
          data={roles}
          searchableColumns={['name', 'description']}
          defaultSort={{ column: 'name', direction: 'asc' }}
          pageSize={10}
          enableSearch={true}
          enablePagination={true}
          searchPlaceholder='Search roles by name or description...'
        />
      </PageShell>

      <CreateRoleModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />

      {selectedRole && (
        <>
          <EditRoleModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            role={selectedRole}
            onSuccess={handleEditSuccess}
          />

          <DetachRoleModal
            open={detachModalOpen}
            onClose={() => {
              setDetachModalOpen(false);
              setSelectedRole(null);
            }}
            role={selectedRole}
            onDetach={handleDetach}
          />

        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedRole(null);
          }}
          onConfirm={handleDeleteConfirm}
          resourceName={selectedRole.name}
          resourceType='Role'
        />
        </>
      )}
    </>
  );
}
