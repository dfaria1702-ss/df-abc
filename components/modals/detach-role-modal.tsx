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
import { Shield, Users } from 'lucide-react';
import {
  type Role,
  type Group,
  type User,
  getGroupsByRoleId,
  getUsersByRoleId,
} from '@/lib/iam-data';

interface DetachRoleModalProps {
  open: boolean;
  onClose: () => void;
  role: Role;
  onDetach: (detachedGroupIds: string[], detachedUserIds: string[]) => void;
}

export function DetachRoleModal({
  open,
  onClose,
  role,
  onDetach,
}: DetachRoleModalProps) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const groups = getGroupsByRoleId(role.id);
  const users = getUsersByRoleId(role.id);

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkDetachGroups = () => {
    setSelectedGroups(groups.map(g => g.id));
  };

  const handleBulkDetachUsers = () => {
    setSelectedUsers(users.map(u => u.id));
  };

  const handleDetach = () => {
    if (selectedGroups.length === 0 && selectedUsers.length === 0) {
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onDetach(selectedGroups, selectedUsers);
      setLoading(false);
      onClose();
      // Reset selections
      setSelectedGroups([]);
      setSelectedUsers([]);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Detach Role from Groups and Users</DialogTitle>
          <DialogDescription>
            Before deleting <strong>{role.name}</strong>, you need to detach it
            from the following groups and users.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Groups Section */}
          {groups.length > 0 && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Users className='h-4 w-4 text-muted-foreground' />
                  <Label className='text-sm font-medium'>
                    Groups ({groups.length})
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
                {groups.map(group => (
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

          {/* Users Section */}
          {users.length > 0 && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Shield className='h-4 w-4 text-muted-foreground' />
                  <Label className='text-sm font-medium'>
                    Users ({users.length})
                  </Label>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleBulkDetachUsers}
                >
                  Select All
                </Button>
              </div>
              <div className='max-h-[200px] overflow-y-auto space-y-2'>
                {users.map(user => (
                  <Card
                    key={user.id}
                    className={`cursor-pointer transition-colors ${
                      selectedUsers.includes(user.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleUser(user.id)}
                  >
                    <CardContent className='p-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='font-medium text-sm'>{user.name}</div>
                          <div className='text-xs text-muted-foreground mt-1'>
                            {user.email}
                          </div>
                        </div>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUser(user.id)}
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {groups.length === 0 && users.length === 0 && (
            <div className='text-center py-8 text-sm text-muted-foreground'>
              No groups or users are using this role
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
              (selectedGroups.length === 0 && selectedUsers.length === 0)
            }
            className='bg-black text-white hover:bg-neutral-800'
          >
            {loading
              ? 'Detaching...'
              : `Detach (${selectedGroups.length + selectedUsers.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

