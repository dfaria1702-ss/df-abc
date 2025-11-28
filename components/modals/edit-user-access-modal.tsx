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
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import {
  mockRoles,
  mockGroups,
  type User,
  getRolesByUserId,
  getGroupsByUserId,
} from '@/lib/iam-data';

interface EditUserAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSuccess: () => void;
}

export function EditUserAccessModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditUserAccessModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [roleSearch, setRoleSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [viewMode, setViewMode] = useState<'roles' | 'groups'>('roles');

  useEffect(() => {
    if (open && user) {
      // Initialize with user's current roles and groups
      setSelectedRoles(user.roleIds);
      setSelectedGroups(user.groupIds);
    }
  }, [open, user]);

  const handleSave = () => {
    // Validate - at least one role or group must be selected
    if (selectedRoles.length === 0 && selectedGroups.length === 0) {
      return;
    }

    // Mock update
    console.log('Updating user access:', {
      userId: user.id,
      roles: selectedRoles,
      groups: selectedGroups,
    });

    // Simulate API call
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 500);
  };

  const handleClose = () => {
    setRoleSearch('');
    setGroupSearch('');
    setViewMode('roles');
    onOpenChange(false);
  };

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

  const filteredRoles = mockRoles.filter(role =>
    role.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
    role.description.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const filteredGroups = mockGroups.filter(group =>
    group.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
    group.description.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const isValid = selectedRoles.length > 0 || selectedGroups.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Edit User Access
          </DialogTitle>
          <p className='text-sm text-muted-foreground pt-2'>
            Modify roles and groups for <strong>{user.name}</strong> ({user.email})
          </p>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>
              Assign Roles & Groups
            </Label>
            <p className='text-xs text-muted-foreground'>
              Select at least one role or group to assign to this user
            </p>
          </div>

          <div className='flex gap-2 border-b'>
            <Button
              variant={viewMode === 'roles' ? 'default' : 'ghost'}
              onClick={() => setViewMode('roles')}
              className='rounded-b-none'
              size='sm'
            >
              Roles
              {selectedRoles.length > 0 && (
                <Badge variant='secondary' className='ml-2'>
                  {selectedRoles.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={viewMode === 'groups' ? 'default' : 'ghost'}
              onClick={() => setViewMode('groups')}
              className='rounded-b-none'
              size='sm'
            >
              Groups
              {selectedGroups.length > 0 && (
                <Badge variant='secondary' className='ml-2'>
                  {selectedGroups.length}
                </Badge>
              )}
            </Button>
          </div>

          <div className='space-y-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder={`Search ${viewMode}...`}
                value={viewMode === 'roles' ? roleSearch : groupSearch}
                onChange={e =>
                  viewMode === 'roles'
                    ? setRoleSearch(e.target.value)
                    : setGroupSearch(e.target.value)
                }
                className='pl-9'
              />
            </div>

            <div className='max-h-[300px] overflow-y-auto space-y-2'>
              {viewMode === 'roles' ? (
                filteredRoles.length > 0 ? (
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
                      <CardContent className='p-4'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <h4 className='font-medium text-sm'>
                                {role.name}
                              </h4>
                              {selectedRoles.includes(role.id) && (
                                <Badge variant='default' className='text-xs'>
                                  Selected
                                </Badge>
                              )}
                            </div>
                            <p className='text-xs text-muted-foreground mt-1'>
                              {role.description}
                            </p>
                            <p className='text-xs text-muted-foreground mt-2'>
                              Created: {new Date(role.createdAt).toLocaleDateString()}
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
                )
              ) : (
                filteredGroups.length > 0 ? (
                  filteredGroups.map(group => (
                    <Card
                      key={group.id}
                      className={`cursor-pointer transition-colors ${
                        selectedGroups.includes(group.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleGroup(group.id)}
                    >
                      <CardContent className='p-4'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <h4 className='font-medium text-sm'>
                                {group.name}
                              </h4>
                              {selectedGroups.includes(group.id) && (
                                <Badge variant='default' className='text-xs'>
                                  Selected
                                </Badge>
                              )}
                            </div>
                            <p className='text-xs text-muted-foreground mt-1'>
                              {group.description}
                            </p>
                            <p className='text-xs text-muted-foreground mt-2'>
                              Created: {new Date(group.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Checkbox
                            checked={selectedGroups.includes(group.id)}
                            onCheckedChange={() => toggleGroup(group.id)}
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className='text-center py-8 text-sm text-muted-foreground'>
                    No groups found
                  </div>
                )
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

