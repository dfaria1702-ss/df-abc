'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users } from 'lucide-react';
import {
  type Policy,
  type Role,
  type Group,
  getRolesByPolicyId,
  getGroupsByRoleId,
  mockGroups,
} from '@/lib/iam-data';

interface DetachPolicyModalProps {
  open: boolean;
  onClose: () => void;
  policy: Policy;
  onDetach: (detachedRoleIds: string[], detachedGroupIds: string[]) => void;
}

export function DetachPolicyModal({
  open,
  onClose,
  policy,
  onDetach,
}: DetachPolicyModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const roles = getRolesByPolicyId(policy.id);
  // Get groups that use roles which use this policy
  const groupsUsingPolicy = mockGroups.filter(group =>
    group.roleIds.some(roleId =>
      roles.some(role => role.id === roleId)
    )
  );

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleBulkDetachRoles = () => {
    setSelectedRoles(roles.map(r => r.id));
  };

  const handleBulkDetachGroups = () => {
    setSelectedGroups(groupsUsingPolicy.map(g => g.id));
  };

  const handleDetach = () => {
    if (selectedRoles.length === 0 && selectedGroups.length === 0) {
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onDetach(selectedRoles, selectedGroups);
      setLoading(false);
      onClose();
      // Reset selections
      setSelectedRoles([]);
      setSelectedGroups([]);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Detach Policy from Roles and Groups</DialogTitle>
          <DialogDescription>
            Before deleting <strong>{policy.name}</strong>, you need to detach it
            from the following roles and groups.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Roles Section */}
          {roles.length > 0 && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Shield className='h-4 w-4 text-muted-foreground' />
                  <Label className='text-sm font-medium'>
                    Roles ({roles.length})
                  </Label>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleBulkDetachRoles}
                >
                  Select All
                </Button>
              </div>
              <div className='max-h-[200px] overflow-y-auto space-y-2'>
                {roles.map(role => (
                  <Card
                    key={role.id}
                    className={`cursor-pointer transition-colors ${
                      selectedRoles.includes(role.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleRole(role.id)}
                  >
                    <CardContent className='p-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='font-medium text-sm'>{role.name}</div>
                          <div className='text-xs text-muted-foreground mt-1'>
                            {role.description}
                          </div>
                        </div>
                        <Checkbox
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Groups Section */}
          {groupsUsingPolicy.length > 0 && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Users className='h-4 w-4 text-muted-foreground' />
                  <Label className='text-sm font-medium'>
                    Groups ({groupsUsingPolicy.length})
                  </Label>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleBulkDetachGroups}
                >
                  Select All
                </Button>
              </div>
              <div className='max-h-[200px] overflow-y-auto space-y-2'>
                {groupsUsingPolicy.map(group => (
                  <Card
                    key={group.id}
                    className={`cursor-pointer transition-colors ${
                      selectedGroups.includes(group.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleGroup(group.id)}
                  >
                    <CardContent className='p-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='font-medium text-sm'>{group.name}</div>
                          <div className='text-xs text-muted-foreground mt-1'>
                            {group.description}
                          </div>
                        </div>
                        <Checkbox
                          checked={selectedGroups.includes(group.id)}
                          onCheckedChange={() => toggleGroup(group.id)}
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {roles.length === 0 && groupsUsingPolicy.length === 0 && (
            <div className='text-center py-8 text-sm text-muted-foreground'>
              No roles or groups are using this policy
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDetach}
            disabled={
              loading ||
              (selectedRoles.length === 0 && selectedGroups.length === 0)
            }
            className='bg-black text-white hover:bg-neutral-800'
          >
            {loading
              ? 'Detaching...'
              : `Detach (${selectedRoles.length + selectedGroups.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

