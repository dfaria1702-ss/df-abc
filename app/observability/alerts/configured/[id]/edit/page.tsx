'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { PageLayout } from '@/components/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  mockConfiguredAlerts,
  formatConditionOperator,
  ConfiguredAlert,
  vmMetrics,
  lbMetrics,
} from '@/lib/observability-data';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const conditionOperators = [
  { value: 'less-than', label: 'Less than (<)' },
  { value: 'greater-than', label: 'Greater than (>)' },
  { value: 'less-than-equal', label: 'Less than or equal to (≤)' },
  { value: 'greater-than-equal', label: 'Greater than or equal to (≥)' },
];

export default function EditAlertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const alert = useMemo(() => {
    return mockConfiguredAlerts.find(a => a.id === id);
  }, [id]);

  if (!alert) {
    notFound();
  }

  const [name, setName] = useState(alert.name);
  const [description, setDescription] = useState(alert.description);
  const [service, setService] = useState<'VM' | 'LB'>(alert.service);
  const [metric, setMetric] = useState(() => {
    // Find the metric ID from the metric name
    const metrics = alert.service === 'VM' ? vmMetrics : lbMetrics;
    const foundMetric = metrics.find(m => m.name === alert.metric);
    return foundMetric?.id || '';
  });
  const [condition, setCondition] = useState(alert.condition);
  const [value, setValue] = useState(alert.thresholdValue.toString());
  const [emailPills, setEmailPills] = useState<string[]>(alert.notificationEmails || []);
  const [emailInput, setEmailInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('alert_notifications_enabled') === 'true';
    }
    return alert.notificationEnabled;
  });
  const isNewUser = !notificationsEnabled;

  // Get available metrics based on service
  const availableMetrics = service === 'VM' ? vmMetrics : lbMetrics;
  
  // Get the current metric display name
  const currentMetricName = useMemo(() => {
    const foundMetric = availableMetrics.find(m => m.id === metric);
    return foundMetric ? `${foundMetric.name} (${foundMetric.unit})` : alert.metric;
  }, [metric, availableMetrics, alert.metric]);

  // Reset form when alert changes
  useEffect(() => {
    setName(alert.name);
    setDescription(alert.description);
    setService(alert.service);
    const metrics = alert.service === 'VM' ? vmMetrics : lbMetrics;
    const foundMetric = metrics.find(m => m.name === alert.metric);
    setMetric(foundMetric?.id || '');
    setCondition(alert.condition);
    setValue(alert.thresholdValue.toString());
    setNotificationsEnabled(alert.notificationEnabled);
    setEmailPills(alert.notificationEmails || []);
    setEmailInput('');
  }, [alert]);

  // Handle notification toggle - can only enable, never disable
  const handleNotificationToggle = (checked: boolean) => {
    if (checked) {
      // Only allow enabling notifications
      setNotificationsEnabled(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('alert_notifications_enabled', 'true');
      }
    }
    // If unchecked, do nothing - notifications cannot be disabled once enabled
  };

  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailInput(value);
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle space after comma to create pill
    if (e.key === ' ' && emailInput.trim().endsWith(',')) {
      e.preventDefault();
      const email = emailInput.replace(/,\s*$/, '').trim();
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
          if (!emailPills.includes(email)) {
            setEmailPills([...emailPills, email]);
            setEmailInput('');
          } else {
            toast({
              title: 'Duplicate Email',
              description: 'This email is already added',
              variant: 'destructive',
            });
            setEmailInput('');
          }
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
          if (!emailPills.includes(email)) {
            setEmailPills([...emailPills, email]);
            setEmailInput('');
          } else {
            toast({
              title: 'Duplicate Email',
              description: 'This email is already added',
              variant: 'destructive',
            });
            setEmailInput('');
          }
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
  };

  const handleEmailBlur = () => {
    // On blur, if there's text, try to add it as a pill
    const email = emailInput.trim();
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        if (!emailPills.includes(email)) {
          setEmailPills([...emailPills, email]);
          setEmailInput('');
        }
      }
    }
  };

  const removeEmail = (index: number) => {
    setEmailPills(emailPills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Alert name is required',
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

    // If notifications are enabled but no emails provided, show warning
    if (notificationEnabled && allEmails.length === 0) {
      toast({
        title: 'Warning',
        description: 'Notifications are enabled but no email addresses are configured. Please add at least one email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, this would update the alert in the backend
      // For now, we'll just show a success message and navigate back
      toast({
        title: 'Alert Updated',
        description: `Alert "${name}" has been updated successfully`,
      });

      router.push(`/observability/alerts/configured/${id}`);
    } catch (error) {
      console.error('Error updating alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to update alert. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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

  const handleCancel = () => {
    router.push(`/observability/alerts/configured/${id}`);
  };

  const customBreadcrumbs = [
    { href: '/dashboard', title: 'Home' },
    { href: '/observability', title: 'Observability' },
    { href: '/observability/alerts', title: 'Alerts' },
    { href: '/observability/alerts/configured', title: 'Configured Alerts' },
    { href: `/observability/alerts/configured/${id}`, title: alert.name },
    { title: 'Edit' },
  ];

  return (
    <PageLayout
      title={`Edit Alert - ${alert.name}`}
      customBreadcrumbs={customBreadcrumbs}
      hideViewDocs={true}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Alert Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter alert name"
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter alert description (optional)"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <Label>
                  Service <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="service-vm"
                      checked={service === 'VM'}
                      disabled={true}
                    />
                    <Label
                      htmlFor="service-vm"
                      className="font-normal text-muted-foreground"
                    >
                      VM
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="service-lb"
                      checked={service === 'LB'}
                      disabled={true}
                    />
                    <Label
                      htmlFor="service-lb"
                      className="font-normal text-muted-foreground"
                    >
                      Load Balancer
                    </Label>
                  </div>
                </div>
              </div>

              {/* Metric Selection - Disabled */}
              <div className="space-y-2">
                <Label htmlFor="metric">
                  Metric <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={metric}
                  onValueChange={() => {}} // Disabled
                  disabled={true}
                >
                  <SelectTrigger id="metric" className="bg-muted cursor-not-allowed opacity-60">
                    <SelectValue placeholder={currentMetricName} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMetrics.map(metricOption => (
                      <SelectItem key={metricOption.id} value={metricOption.id}>
                        {metricOption.name} ({metricOption.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Metric cannot be changed after alert creation
                </p>
              </div>

              {/* Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">
                    Condition <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={condition}
                    onValueChange={setCondition}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="condition">
                      <SelectValue placeholder="Select condition" />
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
                <div className="space-y-2">
                  <Label htmlFor="value">
                    Value <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder="Enter threshold value"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-left"
                  disabled={isSubmitting}
                >
                  <Label className="cursor-pointer font-medium">
                    Advanced Settings
                  </Label>
                  {showAdvanced ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="space-y-3 pt-2 border-t">
                    {/* Enable Notifications Toggle - Only show if notifications are disabled */}
                    {!notificationsEnabled && (
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="enable-notifications" className="text-base font-medium">
                            Enable Email Notifications
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Enable email notifications for alerts
                          </p>
                        </div>
                        <Switch
                          id="enable-notifications"
                          checked={notificationsEnabled}
                          onCheckedChange={handleNotificationToggle}
                          disabled={isSubmitting}
                        />
                      </div>
                    )}
                    
                    {/* Email Notifications Section - Only show if notifications are enabled */}
                    {notificationsEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="emails">Email Notifications</Label>
                        {/* Inline Email Input with Pills */}
                        <div className="flex flex-wrap items-center gap-2 px-3 py-2 border border-input bg-background rounded-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 min-h-[40px]">
                          {/* Email Pills */}
                          {emailPills.map((email, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1 px-2 py-1 text-xs"
                            >
                              {email}
                              <button
                                type="button"
                                onClick={() => removeEmail(index)}
                                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                                disabled={isSubmitting}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          
                          {/* Email Input */}
                          <input
                            id="emails"
                            type="text"
                            value={emailInput}
                            onChange={handleEmailInputChange}
                            onKeyDown={handleEmailKeyDown}
                            onBlur={handleEmailBlur}
                            placeholder={
                              emailPills.length > 0
                                ? 'Add another email address'
                                : 'Enter email addresses (press comma to add)'
                            }
                            disabled={isSubmitting}
                            className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Type an email and press comma or comma+space to add it. Click X on a pill to remove it.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isFormValid()}
                  className="bg-black text-white hover:bg-black/90"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

