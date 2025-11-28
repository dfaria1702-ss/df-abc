'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { mockRoles, mockGroups, type Role, type Group } from '@/lib/iam-data';
import { Card, CardContent } from '@/components/ui/card';

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InviteUserModal({
  open,
  onOpenChange,
  onSuccess,
}: InviteUserModalProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [consoleAccess, setConsoleAccess] = useState(false);
  const [programmaticAccess, setProgrammaticAccess] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [roleSearch, setRoleSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [viewMode, setViewMode] = useState<'roles' | 'groups'>('roles');

  const handleNext = () => {
    if (step === 1) {
      // Validate step 1
      if (!email || (!consoleAccess && !programmaticAccess)) {
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate step 2 - at least one role or group must be selected
      if (selectedRoles.length === 0 && selectedGroups.length === 0) {
        return;
      }
      handleInvite();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleInvite = () => {
    // Mock invitation
    console.log('Inviting user:', {
      email,
      consoleAccess,
      programmaticAccess,
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
    setStep(1);
    setEmail('');
    setConsoleAccess(false);
    setProgrammaticAccess(false);
    setSelectedRoles([]);
    setSelectedGroups([]);
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

  const isValidStep1 = email && (consoleAccess || programmaticAccess);
  const isValidStep2 = selectedRoles.length > 0 || selectedGroups.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Invite User
          </DialogTitle>
          <div className='flex items-center gap-2 pt-2'>
            <div
              className={`h-1 flex-1 rounded ${
                step >= 1 ? 'bg-primary' : 'bg-muted'
              }`}
            />
            <div
              className={`h-1 flex-1 rounded ${
                step >= 2 ? 'bg-primary' : 'bg-muted'
              }`}
            />
          </div>
        </DialogHeader>

        {step === 1 && (
          <div className='space-y-6 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-medium'>
                Email <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='user@example.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full'
              />
              <p className='text-xs text-muted-foreground'>
                Enter the email address of the user you want to invite
              </p>
            </div>

            <div className='space-y-4'>
              <Label className='text-sm font-medium'>Access Type</Label>
              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='console'
                    checked={consoleAccess}
                    onCheckedChange={checked => setConsoleAccess(checked === true)}
                  />
                  <Label
                    htmlFor='console'
                    className='text-sm font-normal cursor-pointer'
                  >
                    Console Access
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='programmatic'
                    checked={programmaticAccess}
                    onCheckedChange={checked =>
                      setProgrammaticAccess(checked === true)
                    }
                  />
                  <Label
                    htmlFor='programmatic'
                    className='text-sm font-normal cursor-pointer'
                  >
                    Programmatic Access
                  </Label>
                </div>
              </div>
              <p className='text-xs text-muted-foreground'>
                Select at least one access type
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
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
        )}

        <DialogFooter className='flex items-center justify-between sm:justify-end gap-2'>
          <div className='flex gap-2'>
            {step > 1 && (
              <Button variant='outline' onClick={handleBack} size='sm'>
                <ChevronLeft className='h-4 w-4 mr-1' />
                Back
              </Button>
            )}
            <Button variant='outline' onClick={handleClose} size='sm'>
              Cancel
            </Button>
          </div>
          <Button
            onClick={handleNext}
            disabled={
              (step === 1 && !isValidStep1) || (step === 2 && !isValidStep2)
            }
            size='sm'
            className='bg-black text-white hover:bg-neutral-800'
          >
            {step === 1 ? (
              <>
                Next
                <ChevronRight className='h-4 w-4 ml-1' />
              </>
            ) : (
              'Send Invitation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

