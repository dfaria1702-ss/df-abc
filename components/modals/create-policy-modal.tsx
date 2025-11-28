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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import {
  type PolicyAccessRule,
  type PolicyType,
  type CRUDOperation,
  type Effect,
  policyTypeOptions,
  crudOperationOptions,
  effectOptions,
} from '@/lib/iam-data';

interface CreatePolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreatePolicyModal({
  open,
  onOpenChange,
  onSuccess,
}: CreatePolicyModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState<PolicyAccessRule[]>([
    {
      id: '1',
      effect: 'Allow',
      operation: 'Read',
      policyType: 'VM',
      resourceName: '',
    },
  ]);

  const handleClose = () => {
    setName('');
    setDescription('');
    setRules([
      {
        id: '1',
        effect: 'Allow',
        operation: 'Read',
        policyType: 'VM',
        resourceName: '',
      },
    ]);
    onOpenChange(false);
  };

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: Date.now().toString(),
        effect: 'Allow',
        operation: 'Read',
        policyType: 'VM',
        resourceName: '',
      },
    ]);
  };

  const removeRule = (id: string) => {
    if (rules.length > 1) {
      setRules(rules.filter(rule => rule.id !== id));
    }
  };

  const updateRule = (
    id: string,
    field: keyof PolicyAccessRule,
    value: string
  ) => {
    setRules(
      rules.map(rule =>
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    );
  };

  const handleCreate = () => {
    // Validate
    if (!name.trim()) return;
    if (rules.some(rule => !rule.resourceName.trim())) return;

    // Mock creation
    console.log('Creating policy:', { name, description, rules });

    // Simulate API call
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 500);
  };

  const isValid = name.trim() && rules.every(rule => rule.resourceName.trim());

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Create Policy
          </DialogTitle>
          <p className='text-sm text-muted-foreground pt-2'>
            Create a new access control policy with multiple rules
          </p>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='name' className='text-sm font-medium'>
              Policy Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='name'
              placeholder='Enter policy name'
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
              placeholder='Enter policy description'
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-sm font-medium'>
                Access Rules <span className='text-destructive'>*</span>
              </Label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={addRule}
              >
                <Plus className='h-4 w-4 mr-1' />
                Add Rule
              </Button>
            </div>

            <div className='space-y-3'>
              {rules.map((rule, index) => (
                <Card key={rule.id} className='p-4'>
                  <div className='flex items-start justify-between mb-4'>
                    <span className='text-sm font-medium text-muted-foreground'>
                      Rule {index + 1}
                    </span>
                    {rules.length > 1 && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => removeRule(rule.id)}
                        className='h-8 w-8 p-0'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    )}
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-xs'>Effect</Label>
                      <Select
                        value={rule.effect}
                        onValueChange={value =>
                          updateRule(rule.id, 'effect', value as Effect)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {effectOptions.map(effect => (
                            <SelectItem key={effect} value={effect}>
                              {effect}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label className='text-xs'>Operation</Label>
                      <Select
                        value={rule.operation}
                        onValueChange={value =>
                          updateRule(
                            rule.id,
                            'operation',
                            value as CRUDOperation
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {crudOperationOptions.map(op => (
                            <SelectItem key={op} value={op}>
                              {op}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label className='text-xs'>Policy Type</Label>
                      <Select
                        value={rule.policyType}
                        onValueChange={value =>
                          updateRule(rule.id, 'policyType', value as PolicyType)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {policyTypeOptions.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label className='text-xs'>Resource Name</Label>
                      <Input
                        placeholder='e.g., vm-*, storage-*'
                        value={rule.resourceName}
                        onChange={e =>
                          updateRule(rule.id, 'resourceName', e.target.value)
                        }
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className='flex items-center justify-end gap-2'>
          <Button variant='outline' onClick={handleClose} size='sm'>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isValid}
            size='sm'
            className='bg-black text-white hover:bg-neutral-800'
          >
            Create Policy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

