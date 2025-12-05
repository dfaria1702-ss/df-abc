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
import { Users } from 'lucide-react';
import { type Group, type User, getUsersByGroupId } from '@/lib/iam-data';

interface DetachGroupModalProps {
  open: boolean;
  onClose: () => void;
  group: Group;
  onDetach: (detachedUserIds: string[]) => void;
}

export function DetachGroupModal({
  open,
  onClose,
  group,
  onDetach,
}: DetachGroupModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const users = getUsersByGroupId(group.id);

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkDetachUsers = () => {
    setSelectedUsers(users.map(u => u.id));
  };

  const handleDetach = () => {
    if (selectedUsers.length === 0) {
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onDetach(selectedUsers);
      setLoading(false);
      onClose();
      // Reset selections
      setSelectedUsers([]);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Detach Group from Users</DialogTitle>
          <DialogDescription>
            Before deleting <strong>{group.name}</strong>, you need to detach it
            from the following users.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Users Section */}
          {users.length > 0 && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Users className='h-4 w-4 text-muted-foreground' />
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
              <div className='max-h-[300px] overflow-y-auto space-y-2'>
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

          {users.length === 0 && (
            <div className='text-center py-8 text-sm text-muted-foreground'>
              No users are assigned to this group
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDetach}
            disabled={loading || selectedUsers.length === 0}
            className='bg-black text-white hover:bg-neutral-800'
          >
            {loading
              ? 'Detaching...'
              : `Detach (${selectedUsers.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

