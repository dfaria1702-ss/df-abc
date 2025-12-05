'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { ShadcnDataTable, type Column } from '@/components/ui/shadcn-data-table';
import { ActionMenu } from '@/components/action-menu';
import {
  mockGroups,
  type Group,
  getGroupById,
  canDeleteGroup,
} from '@/lib/iam-data';
import { CreateGroupModal } from '@/components/modals/create-group-modal';
import { EditGroupModal } from '@/components/modals/edit-group-modal';
import { DetachGroupModal } from '@/components/modals/detach-group-modal';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { useToast } from '@/hooks/use-toast';

export default function GroupsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detachModalOpen, setDetachModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState(mockGroups);

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    toast({
      title: 'Group created successfully',
      description: 'The new group has been created.',
    });
  };

  const handleEditClick = (group: Group) => {
    setSelectedGroup(group);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setSelectedGroup(null);
    toast({
      title: 'Group updated successfully',
      description: 'The group has been updated.',
    });
  };

  const handleDeleteClick = (group: Group) => {
    const validation = canDeleteGroup(group.id);
    if (!validation.canDelete) {
      // Show detachment modal instead
      setSelectedGroup(group);
      setDetachModalOpen(true);
      return;
    }
    setSelectedGroup(group);
    setDeleteModalOpen(true);
  };

  const handleDetach = (detachedUserIds: string[]) => {
    if (selectedGroup) {
      toast({
        title: 'Group detached',
        description: `Group has been detached from ${detachedUserIds.length} user(s).`,
      });
      // After detachment, try deletion again
      const validation = canDeleteGroup(selectedGroup.id);
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
    if (selectedGroup) {
      setGroups(groups.filter(g => g.id !== selectedGroup.id));
      setDeleteModalOpen(false);
      setSelectedGroup(null);
      toast({
        title: 'Group deleted',
        description: `Group "${selectedGroup.name}" has been deleted.`,
      });
    }
  };

  const handleViewGroup = (group: Group) => {
    router.push(`/iam/groups/${group.id}`);
  };

  const columns: Column<Group>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      searchable: true,
      render: (value: string, row: Group) => (
        <div>
          <div
            className='font-medium text-sm cursor-pointer hover:text-primary'
            onClick={() => handleViewGroup(row)}
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
      key: 'roleIds',
      label: 'Roles',
      render: (_: unknown, row: Group) => (
        <div className='text-sm'>
          {row.roleIds.length} role{row.roleIds.length !== 1 ? 's' : ''}
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
      render: (_: unknown, row: Group) => (
        <div className='flex justify-end'>
          <ActionMenu
            viewHref={`/iam/groups/${row.id}`}
            onEdit={() => handleEditClick(row)}
            onDelete={() => handleDeleteClick(row)}
            resourceName={row.name}
            resourceType='Group'
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageShell
        title='Groups'
        description='Organize users into groups with shared permissions'
        headerActions={
          <Button
            onClick={() => setCreateModalOpen(true)}
            className='bg-black text-white rounded-full px-6 py-2 text-base font-medium hover:bg-neutral-800'
          >
            Create Group
          </Button>
        }
      >
        <ShadcnDataTable
          columns={columns}
          data={groups}
          searchableColumns={['name', 'description']}
          defaultSort={{ column: 'name', direction: 'asc' }}
          pageSize={10}
          enableSearch={true}
          enablePagination={true}
          searchPlaceholder='Search groups by name or description...'
        />
      </PageShell>

      <CreateGroupModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />

      {selectedGroup && (
        <>
          <EditGroupModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            group={selectedGroup}
            onSuccess={handleEditSuccess}
          />

          <DetachGroupModal
            open={detachModalOpen}
            onClose={() => {
              setDetachModalOpen(false);
              setSelectedGroup(null);
            }}
            group={selectedGroup}
            onDetach={handleDetach}
          />

          <DeleteConfirmationModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedGroup(null);
            }}
            onConfirm={handleDeleteConfirm}
            resourceName={selectedGroup.name}
            resourceType='Group'
          />
        </>
      )}
    </>
  );
}
