'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/auth-provider';
import { vmMetrics } from '@/lib/observability-data';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { KafkaNotificationAgreementModal } from './kafka-notification-agreement-modal';

interface CreateAlertModalProps {
  open: boolean;
  onClose: () => void;
  vmName?: string;
  vmKrnId?: string;
  onCreate?: (data: {
    name: string;
    description: string;
    vmName: string;
    vmKrnId: string;
    metric: string;
    condition: string;
    value: number;
    sendEmailNotifications: boolean;
  }) => Promise<void>;
}

const conditionOperators = [
  { value: 'less-than', label: 'Less than (<)' },
  { value: 'greater-than', label: 'Greater than (>)' },
  { value: 'less-than-equal', label: 'Less than or equal to (≤)' },
  { value: 'greater-than-equal', label: 'Greater than or equal to (≥)' },
];

export function CreateAlertModal({
  open,
  onClose,
  onCreate,
  vmName = '',
  vmKrnId = '',
}: CreateAlertModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [metric, setMetric] = useState('');
  const [condition, setCondition] = useState('');
  const [value, setValue] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Notification settings
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('alert_email_notifications_enabled') === 'true';
    }
    return false;
  });
  const [sendEmailNotifications, setSendEmailNotifications] = useState(false);
  const [showKafkaModal, setShowKafkaModal] = useState(false);
  const isNewUser = !emailNotificationsEnabled;

  // Get root user's email (use user email from auth context, fallback to mock)
  const rootUserEmail = user?.email || 'root@krutrim.com';

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setMetric('');
      setCondition('');
      setValue('');
      setShowAdvanced(false);
      setShowKafkaModal(false);
      setSendEmailNotifications(false);
    }
  }, [open]);
  
  // Handle first-time email notifications enablement toggle
  const handleEmailNotificationsToggle = (checked: boolean) => {
    if (checked && isNewUser) {
      // For new users, show Kafka agreement modal
      setShowKafkaModal(true);
    }
    // Note: Once enabled, this toggle should not be shown again, so we don't handle unchecking
  };
  
  // Handle Kafka modal confirmation
  const handleKafkaConfirm = () => {
    setEmailNotificationsEnabled(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('alert_email_notifications_enabled', 'true');
    }
    setShowKafkaModal(false);
  };

  const handleCreate = async () => {
    // Validation
    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Alert name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!vmName || !vmKrnId) {
      toast({
        title: 'Validation Error',
        description: 'VM information is required',
        variant: 'destructive',
      });
      return;
    }

    if (!metric) {
      toast({
        title: 'Validation Error',
        description: 'Please select a metric',
        variant: 'destructive',
      });
      return;
    }

    if (!condition) {
      toast({
        title: 'Validation Error',
        description: 'Please select a condition operator',
        variant: 'destructive',
      });
      return;
    }

    if (!value.trim() || isNaN(Number(value))) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid numeric value',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      if (onCreate) {
        await onCreate({
          name: name.trim(),
          description: description.trim(),
          vmName,
          vmKrnId,
          metric,
          condition,
          value: Number(value),
          sendEmailNotifications,
        });
      } else {
        // Mock creation
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
          title: 'Alert Created',
          description: `Alert "${name}" has been created successfully`,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to create alert. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      name.trim() &&
      vmName &&
      vmKrnId &&
      metric &&
      condition &&
      value.trim() &&
      !isNaN(Number(value))
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create Alert</DialogTitle>
          <DialogDescription>
            Configure an alert rule to monitor your infrastructure metrics and
            receive notifications when thresholds are exceeded.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Name */}
          <div className='space-y-2'>
            <Label htmlFor='name'>
              Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='name'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Enter alert name'
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Enter alert description (optional)'
              rows={3}
              disabled={loading}
            />
          </div>

          {/* VM Name - Uneditable */}
          <div className='space-y-2'>
            <Label htmlFor='vm-name'>VM Name</Label>
            <Input
              id='vm-name'
              value={vmName ? `${vmName} (${vmKrnId})` : ''}
              disabled
              className='bg-muted cursor-not-allowed'
            />
          </div>

          {/* Metric Selection */}
          <div className='space-y-2'>
            <Label htmlFor='metric'>
              Metric <span className='text-destructive'>*</span>
            </Label>
            <Select
              value={metric}
              onValueChange={setMetric}
              disabled={loading}
            >
              <SelectTrigger id='metric'>
                <SelectValue placeholder='Select a metric' />
              </SelectTrigger>
              <SelectContent>
                {vmMetrics.map(metricOption => (
                  <SelectItem key={metricOption.id} value={metricOption.id}>
                    {metricOption.name} ({metricOption.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition with Value - Treated as one field with nested fields */}
          <div className='space-y-2'>
            <Label>
              Condition with Value <span className='text-destructive'>*</span>
            </Label>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='condition' className='text-sm text-muted-foreground'>
                  Condition
                </Label>
                <Select
                  value={condition}
                  onValueChange={setCondition}
                  disabled={loading}
                >
                  <SelectTrigger id='condition'>
                    <SelectValue placeholder='Select condition' />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOperators.map(operator => (
                      <SelectItem key={operator.value} value={operator.value}>
                        {operator.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='value' className='text-sm text-muted-foreground'>
                  Value
                </Label>
                <Input
                  id='value'
                  type='number'
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder='Enter threshold value'
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className='space-y-2'>
            <button
              type='button'
              onClick={() => setShowAdvanced(!showAdvanced)}
              className='flex items-center justify-between w-full text-left'
              disabled={loading}
            >
              <Label className='cursor-pointer font-medium'>
                Advanced Settings
              </Label>
              {showAdvanced ? (
                <ChevronUp className='h-4 w-4 text-muted-foreground' />
              ) : (
                <ChevronDown className='h-4 w-4 text-muted-foreground' />
              )}
            </button>

            {showAdvanced && (
              <div className='space-y-4 pt-2 border-t'>
                {/* Enable Email Notifications Toggle - Only shown for first-time enablement */}
                {isNewUser && (
                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label htmlFor='enable-email-notifications' className='text-base font-medium'>
                        Enable Email Notifications
                      </Label>
                      <p className='text-xs text-muted-foreground'>
                        Enable email notifications for alerts (one-time setup)
                      </p>
                    </div>
                    <Switch
                      id='enable-email-notifications'
                      checked={emailNotificationsEnabled}
                      onCheckedChange={handleEmailNotificationsToggle}
                      disabled={loading || emailNotificationsEnabled}
                    />
                  </div>
                )}

                {/* Send Email Notifications Toggle */}
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='send-email-notifications' className='text-base font-medium'>
                      Send Email Notifications
                    </Label>
                    <p className='text-xs text-muted-foreground'>
                      Send email notifications for this alert
                    </p>
                  </div>
                  <Switch
                    id='send-email-notifications'
                    checked={sendEmailNotifications}
                    onCheckedChange={setSendEmailNotifications}
                    disabled={loading || !emailNotificationsEnabled}
                  />
                </div>

                {/* Root User Email - Uneditable */}
                {emailNotificationsEnabled && (
                  <div className='space-y-2'>
                    <Label htmlFor='root-user-email'>Email</Label>
                    <Input
                      id='root-user-email'
                      value={rootUserEmail}
                      disabled
                      className='bg-muted cursor-not-allowed'
                    />
                    <p className='text-xs text-muted-foreground'>
                      Root user email address for notifications
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className='flex gap-2 sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleCreate}
            disabled={loading || !isFormValid()}
          >
            {loading ? 'Creating...' : 'Create Alert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    <KafkaNotificationAgreementModal
      open={showKafkaModal}
      onClose={() => setShowKafkaModal(false)}
      onConfirm={handleKafkaConfirm}
    />
    </>
  );
}

