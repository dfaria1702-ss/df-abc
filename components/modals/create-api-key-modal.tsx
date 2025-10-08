'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { XMarkIcon } from '@heroicons/react/24/outline';
import * as DialogPrimitive from '@radix-ui/react-dialog';

interface CreateApiKeyModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateApiKeyModal({ open, onClose }: CreateApiKeyModalProps) {
  const [secretName, setSecretName] = useState('');

  const handleCreate = () => {
    // Mock API key creation
    console.log('Creating API key with name:', secretName);
    // In real implementation, this would call an API
    onClose();
    setSecretName('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogPortal>
        {/* Custom overlay with higher z-index */}
        <DialogPrimitive.Overlay className='fixed inset-0 z-[60] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />
        
        {/* Custom content with higher z-index */}
        <DialogPrimitive.Content className='fixed left-[50%] top-[50%] z-[60] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg'>
          {/* Close button */}
          <DialogPrimitive.Close className='absolute right-4 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'>
            <XMarkIcon className='h-[1.1rem] w-[1.1rem]' />
            <span className='sr-only'>Close</span>
          </DialogPrimitive.Close>

          <DialogHeader>
            <DialogTitle className='text-base font-semibold text-black'>
              Create New API Key
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='secret-name' className='text-sm font-medium'>
                Secret Name <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='secret-name'
                placeholder='Enter Name'
                value={secretName}
                onChange={(e) => setSecretName(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className='flex items-center justify-end gap-3'>
              <Button
                variant='outline'
                onClick={onClose}
                size='sm'
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!secretName.trim()}
                size='sm'
              >
                Create API Key
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
