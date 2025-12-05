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
import { type User } from '@/lib/iam-data';

interface ResendInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSuccess: () => void;
}

export function ResendInviteModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: ResendInviteModalProps) {
  const [loading, setLoading] = useState(false);

  const handleResend = () => {
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      onSuccess();
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Resend Invitation</DialogTitle>
          <DialogDescription>
            Are you sure you want to resend the invitation email to{' '}
            <strong>{user.email}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className='py-4'>
          <p className='text-sm text-muted-foreground'>
            A new invitation email will be sent to the user's email address.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResend}
            disabled={loading}
            className='bg-black text-white hover:bg-neutral-800'
          >
            {loading ? 'Sending...' : 'Resend Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

