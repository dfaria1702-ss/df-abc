'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { ShadcnDataTable, type Column } from '@/components/ui/shadcn-data-table';
import { ActionMenu } from '@/components/action-menu';
import {
  mockPolicies,
  type Policy,
  getPolicyById,
  canDeletePolicy,
} from '@/lib/iam-data';
import { CreatePolicyModal } from '@/components/modals/create-policy-modal';
import { EditPolicyModal } from '@/components/modals/edit-policy-modal';
import { DetachPolicyModal } from '@/components/modals/detach-policy-modal';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { useToast } from '@/hooks/use-toast';

export default function PoliciesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detachModalOpen, setDetachModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [policies, setPolicies] = useState(mockPolicies);

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    toast({
      title: 'Policy created successfully',
      description: 'The new policy has been created.',
    });
  };

  const handleEditClick = (policy: Policy) => {
    setSelectedPolicy(policy);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setSelectedPolicy(null);
    toast({
      title: 'Policy updated successfully',
      description: 'The policy has been updated.',
    });
  };

  const handleDeleteClick = (policy: Policy) => {
    const validation = canDeletePolicy(policy.id);
    if (!validation.canDelete) {
      // Show detachment modal instead
      setSelectedPolicy(policy);
      setDetachModalOpen(true);
      return;
    }
    setSelectedPolicy(policy);
    setDeleteModalOpen(true);
  };

  const handleDetach = (detachedRoleIds: string[]) => {
    if (selectedPolicy) {
      toast({
        title: 'Policy detached',
        description: `Policy has been detached from ${detachedRoleIds.length} role(s).`,
      });
      // After detachment, try deletion again
      const validation = canDeletePolicy(selectedPolicy.id);
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
    if (selectedPolicy) {
      setPolicies(policies.filter(p => p.id !== selectedPolicy.id));
      setDeleteModalOpen(false);
      setSelectedPolicy(null);
      toast({
        title: 'Policy deleted',
        description: `Policy "${selectedPolicy.name}" has been deleted.`,
      });
    }
  };

  const handleViewPolicy = (policy: Policy) => {
    router.push(`/iam/policies/${policy.id}`);
  };

  const columns: Column<Policy>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      searchable: true,
      render: (value: string, row: Policy) => (
        <div>
          <div
            className='font-medium text-sm cursor-pointer hover:text-primary'
            onClick={() => handleViewPolicy(row)}
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
      key: 'creatorName',
      label: 'Created By',
      sortable: true,
      render: (value: string, row: Policy) => (
        <div className='text-sm'>
          <div>{row.creatorName}</div>
          <div className='text-xs text-muted-foreground'>{row.creatorEmail}</div>
        </div>
      ),
    },
    {
      key: 'rules',
      label: 'Rules',
      render: (_: unknown, row: Policy) => (
        <div className='text-sm'>{row.rules.length} rule{row.rules.length !== 1 ? 's' : ''}</div>
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (_: unknown, row: Policy) => (
        <div className='flex justify-end'>
          <ActionMenu
            viewHref={`/iam/policies/${row.id}`}
            onEdit={() => handleEditClick(row)}
            onCustomDelete={() => handleDeleteClick(row)}
            resourceName={row.name}
            resourceType='Policy'
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageShell
        title='Policies'
        description='Create and manage access control policies'
        headerActions={
          <Button
            onClick={() => setCreateModalOpen(true)}
            className='bg-black text-white rounded-full px-6 py-2 text-base font-medium hover:bg-neutral-800'
          >
            Create Policy
          </Button>
        }
      >
        <ShadcnDataTable
          columns={columns}
          data={policies}
          searchableColumns={['name', 'description']}
          defaultSort={{ column: 'name', direction: 'asc' }}
          pageSize={10}
          enableSearch={true}
          enablePagination={true}
          searchPlaceholder='Search policies by name or description...'
        />
      </PageShell>

      <CreatePolicyModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />

      {selectedPolicy && (
        <>
          <EditPolicyModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            policy={selectedPolicy}
            onSuccess={handleEditSuccess}
          />

          <DetachPolicyModal
            open={detachModalOpen}
            onClose={() => {
              setDetachModalOpen(false);
              setSelectedPolicy(null);
            }}
            policy={selectedPolicy}
            onDetach={handleDetach}
          />

        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedPolicy(null);
          }}
          onConfirm={handleDeleteConfirm}
          resourceName={selectedPolicy.name}
          resourceType='Policy'
        />
        </>
      )}
    </>
  );
}

