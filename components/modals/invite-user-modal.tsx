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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, X, ChevronRight, ChevronLeft, RefreshCw, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { mockRoles, mockGroups, type Role, type Group } from '@/lib/iam-data';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Generate a random password
const generatePassword = (length: number = 16): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [consoleAccess, setConsoleAccess] = useState(false);
  const [programmaticAccess, setProgrammaticAccess] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [roleSearch, setRoleSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [viewMode, setViewMode] = useState<'roles' | 'groups'>('roles');

  // Generate password when modal opens
  useEffect(() => {
    if (open) {
      setPassword(generatePassword());
    }
  }, [open]);

  const handleRegeneratePassword = () => {
    setPassword(generatePassword());
    setCopied(false);
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate step 1
      if (!email || !username || !password || (!consoleAccess && !programmaticAccess)) {
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
      username,
      password,
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
    setUsername('');
    setPassword('');
    setShowPassword(false);
    setCopied(false);
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

  const isValidStep1 = email && username && password && (consoleAccess || programmaticAccess);
  const isValidStep2 = selectedRoles.length > 0 || selectedGroups.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Add User
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

            <div className='space-y-2'>
              <Label htmlFor='username' className='text-sm font-medium'>
                Username <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='username'
                type='text'
                placeholder='johndoe'
                value={username}
                onChange={e => setUsername(e.target.value)}
                className='w-full'
              />
              <p className='text-xs text-muted-foreground'>
                Enter a unique username for the user
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

            <div className='space-y-2'>
              <Label htmlFor='password' className='text-sm font-medium'>
                Generated Password <span className='text-destructive'>*</span>
              </Label>
              <div className='flex items-center gap-2'>
                <div className='relative flex-1'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    readOnly
                    className='pr-10 font-mono text-sm'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4 text-muted-foreground' />
                    ) : (
                      <Eye className='h-4 w-4 text-muted-foreground' />
                    )}
                  </Button>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={handleRegeneratePassword}
                  title='Regenerate password'
                >
                  <RefreshCw className='h-4 w-4' />
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={handleCopyPassword}
                  title='Copy password'
                >
                  {copied ? (
                    <Check className='h-4 w-4 text-green-600' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </Button>
              </div>
              <p className='text-xs text-muted-foreground'>
                This password will be sent to the user. Make sure to copy it before proceeding.
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

              <div className='max-h-[300px] overflow-y-auto border rounded-md'>
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map((role, index) => (
                      <div
                        key={role.id}
                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                          selectedRoles.includes(role.id)
                            ? 'bg-primary/5'
                            : 'hover:bg-muted/50'
                        } ${index !== filteredRoles.length - 1 ? 'border-b' : ''}`}
                        onClick={() => toggleRole(role.id)}
                      >
                        <Checkbox
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                          onClick={e => e.stopPropagation()}
                        />
                        <div className='flex-1 min-w-0'>
                          <div className='font-medium text-sm truncate'>
                            {role.name}
                          </div>
                          <div className='text-xs text-muted-foreground truncate'>
                            {role.description}
                          </div>
                        </div>
                      </div>
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

                <div className='max-h-[300px] overflow-y-auto border rounded-md'>
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map((group, index) => (
                      <div
                        key={group.id}
                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                          selectedGroups.includes(group.id)
                            ? 'bg-primary/5'
                            : 'hover:bg-muted/50'
                        } ${index !== filteredGroups.length - 1 ? 'border-b' : ''}`}
                        onClick={() => toggleGroup(group.id)}
                      >
                        <Checkbox
                          checked={selectedGroups.includes(group.id)}
                          onCheckedChange={() => toggleGroup(group.id)}
                          onClick={e => e.stopPropagation()}
                        />
                        <div className='flex-1 min-w-0'>
                          <div className='font-medium text-sm truncate'>
                            {group.name}
                          </div>
                          <div className='text-xs text-muted-foreground truncate'>
                            {group.description}
                          </div>
                        </div>
                      </div>
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

