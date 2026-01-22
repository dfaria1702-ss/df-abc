'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface KafkaNotificationAgreementModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function KafkaNotificationAgreementModal({
  open,
  onClose,
  onConfirm,
}: KafkaNotificationAgreementModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Enable Email Notifications</DialogTitle>
          <DialogDescription>
            By clicking confirm, you agree to create a topic for the Kafka queuing
            system to send notifications for your account.
          </DialogDescription>
        </DialogHeader>

        <div className='py-4'>
          <p className='text-sm text-muted-foreground'>
            This will set up the necessary infrastructure to receive email
            notifications for your alerts.
          </p>
        </div>

        <DialogFooter className='flex gap-2 sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

