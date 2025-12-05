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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  mockRoles,
  mockGroups,
  type User,
  type AccessType,
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
  const [consoleAccess, setConsoleAccess] = useState(false);
  const [programmaticAccess, setProgrammaticAccess] = useState(false);
  const [roleSearch, setRoleSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [viewMode, setViewMode] = useState<'roles' | 'groups'>('roles');

  useEffect(() => {
    if (open && user) {
      // Initialize with user's current roles and groups
      setSelectedRoles(user.roleIds);
      setSelectedGroups(user.groupIds);
      // Initialize access types
      setConsoleAccess(
        user.accessType === 'console' || user.accessType === 'both'
      );
      setProgrammaticAccess(
        user.accessType === 'programmatic' || user.accessType === 'both'
      );
    }
  }, [open, user]);

  const handleSave = () => {
    // Validate - at least one access type must be selected
    if (!consoleAccess && !programmaticAccess) {
      return;
    }

    // Validate - at least one role or group must be selected
    if (selectedRoles.length === 0 && selectedGroups.length === 0) {
      return;
    }

    // Determine access type
    let accessType: AccessType = 'console';
    if (consoleAccess && programmaticAccess) {
      accessType = 'both';
    } else if (programmaticAccess) {
      accessType = 'programmatic';
    }

    // Mock update
    console.log('Updating user access:', {
      userId: user.id,
      roles: selectedRoles,
      groups: selectedGroups,
      accessType,
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

  const isValid =
    (consoleAccess || programmaticAccess) &&
    (selectedRoles.length > 0 || selectedGroups.length > 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Manage Permissions
          </DialogTitle>
          <p className='text-sm text-muted-foreground pt-2'>
            Manage permissions for <strong>{user.name}</strong> ({user.email})
          </p>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Access Type Section */}
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Access Type</Label>
              <p className='text-xs text-muted-foreground'>
                Select at least one access type
              </p>
            </div>
            <div className='space-y-3'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='console-access'
                  checked={consoleAccess}
                  onCheckedChange={checked => setConsoleAccess(checked === true)}
                />
                <Label
                  htmlFor='console-access'
                  className='text-sm font-normal cursor-pointer'
                >
                  Console Access
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='programmatic-access'
                  checked={programmaticAccess}
                  onCheckedChange={checked =>
                    setProgrammaticAccess(checked === true)
                  }
                />
                <Label
                  htmlFor='programmatic-access'
                  className='text-sm font-normal cursor-pointer'
                >
                  Programmatic Access
                </Label>
              </div>
            </div>
          </div>

          {/* Roles & Groups Section */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>
              Assign Roles & Groups
            </Label>
            <p className='text-xs text-muted-foreground'>
              Select at least one role or group to assign to this user
            </p>
          </div>

          <Tabs
            value={viewMode}
            onValueChange={value => setViewMode(value as 'roles' | 'groups')}
            className='w-full'
          >
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='roles' className='flex items-center gap-2'>
                Roles
                {selectedRoles.length > 0 && (
                  <Badge variant='secondary' className='ml-1'>
                    {selectedRoles.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value='groups' className='flex items-center gap-2'>
                Groups
                {selectedGroups.length > 0 && (
                  <Badge variant='secondary' className='ml-1'>
                    {selectedGroups.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value='roles' className='space-y-4 mt-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search roles...'
                  value={roleSearch}
                  onChange={e => setRoleSearch(e.target.value)}
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
                )}
              </div>
            </TabsContent>

            <TabsContent value='groups' className='space-y-4 mt-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search groups...'
                  value={groupSearch}
                  onChange={e => setGroupSearch(e.target.value)}
                  className='pl-9'
                />
              </div>

              <div className='max-h-[300px] overflow-y-auto space-y-2'>
                {filteredGroups.length > 0 ? (
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
                )}
              </div>
            </TabsContent>
          </Tabs>
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

