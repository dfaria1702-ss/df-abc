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
import { Trash2, Plus, Info, Eye, EyeOff } from 'lucide-react';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
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

interface RuleFormData {
  id: string;
  effect: Effect;
  operations: CRUDOperation[];
  policyType: PolicyType;
  resourceName: string;
}

export function CreatePolicyModal({
  open,
  onOpenChange,
  onSuccess,
}: CreatePolicyModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [rules, setRules] = useState<RuleFormData[]>([
    {
      id: '1',
      effect: 'Allow',
      operations: ['Read'],
      policyType: 'VM',
      resourceName: '',
    },
  ]);

  const handleClose = () => {
    setName('');
    setDescription('');
    setShowJsonPreview(false);
    setRules([
      {
        id: '1',
        effect: 'Allow',
        operations: ['Read'],
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
        operations: ['Read'],
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
    field: keyof RuleFormData,
    value: string | CRUDOperation[]
  ) => {
    setRules(
      rules.map(rule =>
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    );
  };

  const toggleOperation = (ruleId: string, operation: CRUDOperation) => {
    setRules(
      rules.map(rule => {
        if (rule.id === ruleId) {
          const operations = rule.operations.includes(operation)
            ? rule.operations.filter(op => op !== operation)
            : [...rule.operations, operation];
          return { ...rule, operations };
        }
        return rule;
      })
    );
  };

  const handleCreate = () => {
    // Validate
    if (!name.trim()) return;
    if (rules.some(rule => !rule.resourceName.trim() || rule.operations.length === 0))
      return;

    // Convert form rules to PolicyAccessRule format (one rule per operation)
    const policyRules: PolicyAccessRule[] = rules.flatMap(rule =>
      rule.operations.map((operation, idx) => ({
        id: `${rule.id}-${idx}`,
        effect: rule.effect,
        operation,
        policyType: rule.policyType,
        resourceName: rule.resourceName,
      }))
    );

    // Mock creation
    console.log('Creating policy:', { name, description, rules: policyRules });

    // Simulate API call
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 500);
  };

  const isValid =
    name.trim() &&
    rules.every(
      rule => rule.resourceName.trim() && rule.operations.length > 0
    );

  // Generate JSON preview
  const getJsonPreview = () => {
    const policyRules: PolicyAccessRule[] = rules.flatMap(rule =>
      rule.operations.map((operation, idx) => ({
        id: `${rule.id}-${idx}`,
        effect: rule.effect,
        operation,
        policyType: rule.policyType,
        resourceName: rule.resourceName,
      }))
    );

    return JSON.stringify(
      {
        name,
        description,
        rules: policyRules,
      },
      null,
      2
    );
  };

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
          <div className='flex items-center justify-end pt-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setShowJsonPreview(!showJsonPreview)}
            >
              {showJsonPreview ? (
                <>
                  <EyeOff className='h-4 w-4 mr-1' />
                  Hide JSON
                </>
              ) : (
                <>
                  <Eye className='h-4 w-4 mr-1' />
                  View JSON
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {showJsonPreview ? (
            <Card>
              <CardContent className='p-4'>
                <pre className='bg-muted p-4 rounded-md overflow-x-auto text-xs max-h-[500px] overflow-y-auto'>
                  {getJsonPreview()}
                </pre>
              </CardContent>
            </Card>
          ) : (
            <>
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
                        {/* Policy Type - First */}
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

                        {/* Operations - Second (Multi-select) */}
                        <div className='space-y-2'>
                          <Label className='text-xs'>Operation</Label>
                          <div className='border rounded-md p-2 min-h-[40px]'>
                            <div className='flex flex-wrap gap-2'>
                              {crudOperationOptions.map(operation => (
                                <div
                                  key={operation}
                                  className='flex items-center space-x-1'
                                >
                                  <input
                                    type='checkbox'
                                    id={`${rule.id}-${operation}`}
                                    checked={rule.operations.includes(operation)}
                                    onChange={() =>
                                      toggleOperation(rule.id, operation)
                                    }
                                    className='rounded border-gray-300'
                                  />
                                  <Label
                                    htmlFor={`${rule.id}-${operation}`}
                                    className='text-xs cursor-pointer'
                                  >
                                    {operation}
                                  </Label>
                                </div>
                              ))}
                            </div>
                            {rule.operations.length === 0 && (
                              <p className='text-xs text-muted-foreground mt-1'>
                                Select at least one operation
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Effect - Third */}
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

                        {/* Resource Name - Fourth */}
                    <div className='space-y-2'>
                          <div className='flex items-center gap-1'>
                            <Label className='text-xs'>Resource Name</Label>
                            <TooltipWrapper
                              content='Put * if you want to give access of all resources for this policy'
                              inModal={true}
                            >
                              <Info className='h-3 w-3 text-muted-foreground cursor-help' />
                            </TooltipWrapper>
                    </div>
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
            </>
          )}
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

