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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { vmMetrics, lbMetrics } from '@/lib/observability-data';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { KafkaNotificationAgreementModal } from './kafka-notification-agreement-modal';

interface CreateAlertModalProps {
  open: boolean;
  onClose: () => void;
  onCreate?: (data: {
    name: string;
    description: string;
    service: 'VM' | 'LB';
    metric: string;
    condition: string;
    value: number;
    emails: string[];
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
}: CreateAlertModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [service, setService] = useState<'VM' | 'LB' | ''>('');
  const [metric, setMetric] = useState('');
  const [condition, setCondition] = useState('');
  const [value, setValue] = useState('');
  const [emailPills, setEmailPills] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('alert_notifications_enabled') === 'true';
    }
    return false;
  });
  const [showKafkaModal, setShowKafkaModal] = useState(false);
  const isNewUser = !notificationsEnabled;

  // Get available metrics based on service selection
  const availableMetrics = service === 'VM' ? vmMetrics : service === 'LB' ? lbMetrics : [];

  // Reset metric when service changes
  useEffect(() => {
    setMetric('');
  }, [service]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setService('');
      setMetric('');
      setCondition('');
      setValue('');
      setEmailPills([]);
      setEmailInput('');
      setShowAdvanced(false);
      setShowKafkaModal(false);
    }
  }, [open]);
  
  // Handle notification toggle
  const handleNotificationToggle = (checked: boolean) => {
    if (checked && isNewUser) {
      // For new users, show Kafka agreement modal
      setShowKafkaModal(true);
    } else if (checked) {
      // For repeat users, just enable
      setNotificationsEnabled(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('alert_notifications_enabled', 'true');
      }
    } else {
      // Disable notifications
      setNotificationsEnabled(false);
      setEmailPills([]);
      setEmailInput('');
      if (typeof window !== 'undefined') {
        localStorage.setItem('alert_notifications_enabled', 'false');
      }
    }
  };
  
  // Handle Kafka modal confirmation
  const handleKafkaConfirm = () => {
    setNotificationsEnabled(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('alert_notifications_enabled', 'true');
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

    if (!service) {
      toast({
        title: 'Validation Error',
        description: 'Please select a service (VM or LB)',
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

    // Validate email format if emails are provided
    const allEmails = [...emailPills];
    if (emailInput.trim()) {
      // Also include any email in the input field
      const inputEmails = emailInput
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
      allEmails.push(...inputEmails);
    }

    if (allEmails.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = allEmails.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        toast({
          title: 'Validation Error',
          description: `Invalid email format: ${invalidEmails.join(', ')}`,
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);
    try {
      if (onCreate) {
        await onCreate({
          name: name.trim(),
          description: description.trim(),
          service: service as 'VM' | 'LB',
          metric,
          condition,
          value: Number(value),
          emails: allEmails,
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
      service &&
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

          {/* Service Selection */}
          <div className='space-y-2'>
            <Label>
              Service <span className='text-destructive'>*</span>
            </Label>
            <div className='space-y-3'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='service-vm'
                  checked={service === 'VM'}
                  onCheckedChange={checked => {
                    setService(checked ? 'VM' : '');
                    if (checked) {
                      setMetric(''); // Reset metric when service changes
                    }
                  }}
                  disabled={loading}
                />
                <Label
                  htmlFor='service-vm'
                  className='font-normal cursor-pointer'
                >
                  VM
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='service-lb'
                  checked={service === 'LB'}
                  onCheckedChange={checked => {
                    setService(checked ? 'LB' : '');
                    if (checked) {
                      setMetric(''); // Reset metric when service changes
                    }
                  }}
                  disabled={loading}
                />
                <Label
                  htmlFor='service-lb'
                  className='font-normal cursor-pointer'
                >
                  Load Balancer
                </Label>
              </div>
            </div>
          </div>

          {/* Metric Selection */}
          <div className='space-y-2'>
            <Label htmlFor='metric'>
              Metric <span className='text-destructive'>*</span>
            </Label>
            <Select
              value={metric}
              onValueChange={setMetric}
              disabled={loading || !service}
            >
              <SelectTrigger id='metric'>
                <SelectValue 
                  placeholder={service ? 'Select a metric' : 'Select a service first'} 
                />
              </SelectTrigger>
              <SelectContent>
                {availableMetrics.map(metricOption => (
                  <SelectItem key={metricOption.id} value={metricOption.id}>
                    {metricOption.name} ({metricOption.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='condition'>
                Condition <span className='text-destructive'>*</span>
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
              <Label htmlFor='value'>
                Value <span className='text-destructive'>*</span>
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
              <div className='space-y-3 pt-2 border-t'>
                {/* Enable Notifications Toggle - Only for new users */}
                {isNewUser && (
                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label htmlFor='enable-notifications' className='text-base font-medium'>
                        Enable Email Notifications
                      </Label>
                      <p className='text-xs text-muted-foreground'>
                        Enable email notifications for alerts
                      </p>
                    </div>
                    <Switch
                      id='enable-notifications'
                      checked={notificationsEnabled}
                      onCheckedChange={handleNotificationToggle}
                      disabled={loading}
                    />
                  </div>
                )}
                
                <div className='space-y-2'>
                  <Label htmlFor='emails'>Email Notifications</Label>
                  {/* Inline Email Input with Pills */}
                  <div className={`flex flex-wrap items-center gap-2 px-3 py-2 border border-input bg-background rounded-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 min-h-[40px] ${!notificationsEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {/* Email Pills */}
                  {emailPills.map((email, index) => (
                    <Badge
                      key={index}
                      variant='secondary'
                      className='flex items-center gap-1 px-2 py-1 text-xs'
                    >
                      {email}
                      <button
                        type='button'
                        onClick={() => {
                          setEmailPills(emailPills.filter((_, i) => i !== index));
                        }}
                        className='ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5'
                        disabled={loading}
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  ))}
                  
                  {/* Email Input */}
                  <input
                    id='emails'
                    type='text'
                    value={emailInput}
                    onChange={e => {
                      const value = e.target.value;
                      setEmailInput(value);
                    }}
                    onKeyDown={e => {
                      // Handle space after comma to create pill
                      if (e.key === ' ' && emailInput.trim().endsWith(',')) {
                        e.preventDefault();
                        const email = emailInput.replace(/,\s*$/, '').trim();
                        if (email) {
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          if (emailRegex.test(email)) {
                            setEmailPills([...emailPills, email]);
                            setEmailInput('');
                          } else {
                            toast({
                              title: 'Invalid Email',
                              description: 'Please enter a valid email address',
                              variant: 'destructive',
                            });
                          }
                        } else {
                          setEmailInput('');
                        }
                      }
                      // Also handle comma for convenience (creates pill immediately)
                      else if (e.key === ',') {
                        e.preventDefault();
                        const email = emailInput.trim();
                        if (email) {
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          if (emailRegex.test(email)) {
                            setEmailPills([...emailPills, email]);
                            setEmailInput('');
                          } else {
                            toast({
                              title: 'Invalid Email',
                              description: 'Please enter a valid email address',
                              variant: 'destructive',
                            });
                          }
                        }
                      }
                      // Handle backspace on empty input to remove last pill
                      else if (e.key === 'Backspace' && emailInput === '' && emailPills.length > 0) {
                        setEmailPills(emailPills.slice(0, -1));
                      }
                    }}
                    onBlur={() => {
                      // On blur, if there's text, try to add it as a pill
                      const email = emailInput.trim();
                      if (email) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (emailRegex.test(email)) {
                          setEmailPills([...emailPills, email]);
                          setEmailInput('');
                        }
                      }
                    }}
                    placeholder={
                      !notificationsEnabled
                        ? 'Enable notifications to add email addresses'
                        : emailPills.length > 0
                        ? 'Add another email address'
                        : 'Enter email addresses (press comma to add)'
                    }
                    disabled={loading || !notificationsEnabled}
                    className='flex-1 min-w-[120px] outline-none bg-transparent text-sm disabled:cursor-not-allowed'
                  />
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {!notificationsEnabled
                      ? 'Enable email notifications above to add email addresses'
                      : 'Type an email and press comma or comma+space to add it. Click X on a pill to remove it.'}
                  </p>
                </div>
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

