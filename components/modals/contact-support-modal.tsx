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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ContactSupportModalProps {
  open: boolean;
  onClose: () => void;
}

export function ContactSupportModal({
  open,
  onClose,
}: ContactSupportModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.subject.trim() ||
      !formData.category ||
      !formData.message.trim()
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Support Request Submitted Successfully! 🎉',
        description:
          'Thank you for contacting us. Our support team will get back to you within 24 hours.',
      });

      // Reset form and close modal
      setFormData({
        subject: '',
        category: '',
        message: '',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description:
          'There was an error submitting your request. Please try again or email us directly at support@olakrutrim.com',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Contact Support
          </DialogTitle>
          <p className='text-sm text-muted-foreground'>
            Have a question or need help? Fill out the form below and our team
            will get back to you soon.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Category Field */}
          <div className='space-y-2'>
            <Label htmlFor='category' className='text-sm font-medium'>
              Issue Category <span className='text-destructive'>*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={value => handleInputChange('category', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className='focus:ring-2 focus:ring-ring focus:ring-offset-2'>
                <SelectValue placeholder='Select a category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='billing'>Billing & Payments</SelectItem>
                <SelectItem value='technical'>Technical Support</SelectItem>
                <SelectItem value='account'>Account & Access</SelectItem>
                <SelectItem value='feature'>Feature Request</SelectItem>
                <SelectItem value='bug'>Bug Report</SelectItem>
                <SelectItem value='general'>General Inquiry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject Field */}
          <div className='space-y-2'>
            <Label htmlFor='subject' className='text-sm font-medium'>
              Subject <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='subject'
              value={formData.subject}
              onChange={e => handleInputChange('subject', e.target.value)}
              placeholder='Brief description of your issue'
              required
              disabled={isSubmitting}
              className='focus:ring-2 focus:ring-ring focus:ring-offset-2'
            />
          </div>

          {/* Message Field */}
          <div className='space-y-2'>
            <Label htmlFor='message' className='text-sm font-medium'>
              Message <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='message'
              value={formData.message}
              onChange={e => handleInputChange('message', e.target.value)}
              placeholder='Please provide detailed information about your issue or question...'
              required
              disabled={isSubmitting}
              rows={5}
              className='focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none'
            />
          </div>

          <DialogFooter className='flex gap-3 sm:justify-end pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='bg-primary hover:bg-primary/90'
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

