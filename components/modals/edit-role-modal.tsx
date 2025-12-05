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
import { mockPolicies, type Role, type Policy } from '@/lib/iam-data';

interface EditRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
  onSuccess: () => void;
}

export function EditRoleModal({
  open,
  onOpenChange,
  role,
  onSuccess,
}: EditRoleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open && role) {
      setName(role.name);
      setDescription(role.description);
      setSelectedPolicies(role.policyIds);
    }
  }, [open, role]);

  const handleClose = () => {
    setSearch('');
    onOpenChange(false);
  };

  const togglePolicy = (policyId: string) => {
    setSelectedPolicies(prev =>
      prev.includes(policyId)
        ? prev.filter(id => id !== policyId)
        : [...prev, policyId]
    );
  };

  const handleSave = () => {
    // Validate
    if (!name.trim()) return;
    if (selectedPolicies.length === 0) return;

    // Mock update
    console.log('Updating role:', {
      roleId: role.id,
      name,
      description,
      policies: selectedPolicies,
    });

    // Simulate API call
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 500);
  };

  const filteredPolicies = mockPolicies.filter(
    policy =>
      policy.name.toLowerCase().includes(search.toLowerCase()) ||
      policy.description.toLowerCase().includes(search.toLowerCase())
  );

  const isValid = name.trim() && selectedPolicies.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Edit Role
          </DialogTitle>
          <p className='text-sm text-muted-foreground pt-2'>
            Modify role details and attached policies
          </p>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='name' className='text-sm font-medium'>
              Role Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='name'
              placeholder='Enter role name'
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
              placeholder='Enter role description'
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>
                Attach Policies <span className='text-destructive'>*</span>
              </Label>
              <p className='text-xs text-muted-foreground'>
                Select at least one policy to attach to this role
              </p>
            </div>

            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search policies...'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='pl-9'
              />
            </div>

            <div className='max-h-[300px] overflow-y-auto space-y-2'>
              {filteredPolicies.length > 0 ? (
                filteredPolicies.map(policy => (
                  <Card
                    key={policy.id}
                    className={`cursor-pointer transition-colors ${
                      selectedPolicies.includes(policy.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => togglePolicy(policy.id)}
                  >
                    <CardContent className='p-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <h4 className='font-medium text-sm'>
                              {policy.name}
                            </h4>
                            {selectedPolicies.includes(policy.id) && (
                              <span className='text-xs text-primary font-medium'>
                                Selected
                              </span>
                            )}
                          </div>
                          <p className='text-xs text-muted-foreground mt-0.5'>
                            {policy.description}
                          </p>
                        </div>
                        <Checkbox
                          checked={selectedPolicies.includes(policy.id)}
                          onCheckedChange={() => togglePolicy(policy.id)}
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className='text-center py-8 text-sm text-muted-foreground'>
                  No policies found
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

