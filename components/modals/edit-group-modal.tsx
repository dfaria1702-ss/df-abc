'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { mockRoles, type Group } from '@/lib/iam-data';

interface EditGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
  onSuccess: () => void;
}

export function EditGroupModal({
  open,
  onOpenChange,
  group,
  onSuccess,
}: EditGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open && group) {
      setName(group.name);
      setDescription(group.description);
      setSelectedRoles(group.roleIds);
    }
  }, [open, group]);

  const handleClose = () => {
    setSearch('');
    onOpenChange(false);
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = () => {
    // Validate
    if (!name.trim()) return;

    // Mock update
    console.log('Updating group:', {
      groupId: group.id,
      name,
      description,
      roles: selectedRoles,
    });

    // Simulate API call
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 500);
  };

  const filteredRoles = mockRoles.filter(
    role =>
      role.name.toLowerCase().includes(search.toLowerCase()) ||
      role.description.toLowerCase().includes(search.toLowerCase())
  );

  const isValid = name.trim();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Edit Group
          </DialogTitle>
          <p className='text-sm text-muted-foreground pt-2'>
            Modify group details and attached roles
          </p>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='name' className='text-sm font-medium'>
              Group Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='name'
              placeholder='Enter group name'
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description' className='text-sm font-medium'>
              Description
            </Label>
            <Textarea
              id='description'
              placeholder='Enter group description'
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Attach Roles</Label>
              <p className='text-xs text-muted-foreground'>
                Select roles to attach to this group
              </p>
            </div>

            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search roles...'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='pl-9'
              />
            </div>

            <div className='max-h-[300px] overflow-y-auto space-y-2'>
              {filteredRoles.length > 0 ? (
                filteredRoles.map(role => (
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
                          <div className='flex items-center gap-2'>
                            <h4 className='font-medium text-sm'>
                              {role.name}
                            </h4>
                            {selectedRoles.includes(role.id) && (
                              <span className='text-xs text-primary font-medium'>
                                Selected
                              </span>
                            )}
                          </div>
                          <p className='text-xs text-muted-foreground mt-0.5'>
                            {role.description}
                          </p>
                        </div>
                        <Checkbox
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className='text-center py-8 text-sm text-muted-foreground'>
                  No roles found
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className='flex items-center justify-end gap-2'>
          <Button variant='outline' onClick={handleClose} size='sm'>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid}
            size='sm'
            className='bg-black text-white hover:bg-neutral-800'
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

