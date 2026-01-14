'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '@/components/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Info, ArrowLeft } from 'lucide-react';
import type { LoadBalancerConfiguration } from '../page';
import type { ALBFormData } from '../components/alb-create-form';

export default function LoadBalancerSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [config, setConfig] = useState<LoadBalancerConfiguration | null>(null);
  const [formData, setFormData] = useState<ALBFormData | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    try {
      const configParam = searchParams.get('config');
      const dataParam = searchParams.get('data');

      if (configParam && dataParam) {
        setConfig(JSON.parse(configParam));
        setFormData(JSON.parse(dataParam));
      } else {
        // Redirect back if no data
        router.push('/networking/load-balancing/balancer/create');
      }
    } catch (error) {
      console.error('Error parsing data:', error);
      router.push('/networking/load-balancing/balancer/create');
    }
  }, [searchParams, router]);

  const handleCreateLoadBalancer = async () => {
    if (!config || !formData) {
      return;
    }

    setIsCreating(true);

    try {
      // In a real app, this would submit to API
      console.log('Creating ALB:', { config, formData });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show success toast
      toast({
        title: 'Load Balancer Created Successfully!',
        description: `${formData.name} has been created and is now active.`,
        duration: 5000,
      });

      // Redirect to load balancer list
      router.push('/networking/load-balancing');
    } catch (error) {
      console.error('Error creating load balancer:', error);
      toast({
        title: 'Creation Failed',
        description:
          'There was an error creating your load balancer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleBackToEdit = () => {
    router.back();
  };

  const handleCancel = () => {
    router.push('/networking/load-balancing/balancer');
  };

  if (!config || !formData) {
    return (
      <PageLayout
        title='Load Balancer Summary'
        description='Loading summary...'
      >
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <p className='text-muted-foreground'>Loading configuration...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const getFullLoadBalancerTypeName = (config: LoadBalancerConfiguration) => {
    const infrastructure =
      config.infrastructureType === 'SW' ? 'Software' : 'Hardware (F5)';
    const type =
      config.loadBalancerType === 'ALB'
        ? 'Application Load Balancer'
        : 'Network Load Balancer';
    return `${infrastructure} ${type}`;
  };

  return (
    <PageLayout
      title='Review Load Balancer Configuration'
      description='Review your configuration before creating the load balancer'
    >
      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Main Content */}
        <div className='flex-1 space-y-6'>
          {/* Configuration Summary */}
          <Card>
            <CardContent className='space-y-6 pt-6'>
              {/* Basic Configuration */}
              <div>
                <h3 className='font-semibold mb-4'>Basic Configuration</h3>
                <div className='grid md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Load Balancer Name
                    </Label>
                    <p className='text-sm'>{formData.name || '—'}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Type
                    </Label>
                    <p className='text-sm'>
                      {getFullLoadBalancerTypeName(config)}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Region
                    </Label>
                    <p className='text-sm'>{formData.region || '—'}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      VPC
                    </Label>
                    <p className='text-sm'>{formData.vpc || '—'}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Subnet
                    </Label>
                    <p className='text-sm'>{formData.subnet || '—'}</p>
                  </div>
                  {formData.description && (
                    <div className='md:col-span-2'>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        Description
                      </Label>
                      <p className='text-sm'>{formData.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Advanced Configuration */}
              <div>
                <h3 className='font-semibold mb-4'>Advanced Configuration</h3>

                {/* Listeners */}
                <div className='mb-6'>
                  <h4 className='text-sm font-medium mb-3'>Listeners</h4>
                  {formData.listeners && formData.listeners.length > 0 ? (
                    <div className='space-y-3'>
                      {formData.listeners.map((listener, index) => (
                        <div
                          key={listener.id}
                          className='p-3 border rounded-lg bg-background'
                        >
                          <div className='flex items-center justify-between mb-2'>
                            <span className='text-sm font-medium'>
                              {listener.name || `Listener ${index + 1}`}
                            </span>
                            <Badge variant='outline'>{listener.protocol}</Badge>
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            Port: {listener.port} |
                            {listener.alpnProtocol &&
                              ` ALPN: ${listener.alpnProtocol} | `}
                            {listener.certificate &&
                              ` Certificate: ${listener.certificate}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground text-sm'>
                      No listeners configured
                    </p>
                  )}
                </div>

                {/* Policies and Rules */}
                <div className='mb-6'>
                  <h4 className='text-sm font-medium mb-3'>Policies & Rules</h4>
                  <div className='grid md:grid-cols-2 gap-4'>
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        Policies
                      </Label>
                      {formData.policies && formData.policies.length > 0 ? (
                        <div className='space-y-2'>
                          {formData.policies.map((policy, index) => (
                            <div
                              key={policy.id}
                              className='p-2 border rounded text-sm'
                            >
                              <span className='text-sm font-medium'>
                                {policy.name || `Policy ${index + 1}`}
                              </span>
                              <span className='text-muted-foreground ml-2'>
                                ({policy.action})
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className='text-muted-foreground text-sm'>
                          No policies configured
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        Rules
                      </Label>
                      {formData.rules && formData.rules.length > 0 ? (
                        <div className='space-y-2'>
                          {formData.rules.map((rule, index) => (
                            <div
                              key={rule.id}
                              className='p-2 border rounded text-sm'
                            >
                              <span className='text-sm font-medium'>
                                {rule.ruleType}
                              </span>
                              <span className='text-muted-foreground ml-2'>
                                {rule.comparator} {rule.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className='text-muted-foreground text-sm'>
                          No rules configured
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pools */}
                <div>
                  <h4 className='text-sm font-medium mb-3'>Pools</h4>
                  {formData.pools && formData.pools.length > 0 ? (
                    <div className='space-y-3'>
                      {formData.pools.map((pool, index) => (
                        <div
                          key={pool.id}
                          className='p-3 border rounded-lg bg-background'
                        >
                          <div className='flex items-center justify-between mb-2'>
                            <span className='text-sm font-medium'>
                              {pool.name || `Pool ${index + 1}`}
                            </span>
                            <Badge variant='outline'>{pool.algorithm}</Badge>
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            Protocol: {pool.protocol} | Target Group:{' '}
                            {pool.targetGroup}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground text-sm'>
                      No pools configured
                    </p>
                  )}
                </div>
              </div>
            </CardContent>

            {/* Action Buttons */}
            <div className='flex justify-between px-6 pb-6'>
              <Button
                type='button'
                variant='outline'
                onClick={handleBackToEdit}
                className='flex items-center gap-2'
              >
                <ArrowLeft className='h-4 w-4' />
                Back to Edit
              </Button>

              <div className='flex gap-4'>
                <Button
                  type='button'
                  variant='outline'
                  className='hover:bg-secondary transition-colors'
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateLoadBalancer}
                  disabled={isCreating}
                  className={`transition-colors ${
                    isCreating
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-black/90'
                  }`}
                >
                  {isCreating ? (
                    <>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2'></div>
                      Creating...
                    </>
                  ) : (
                    'Create Load Balancer'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <div className='w-full lg:w-80 space-y-6'>
          {/* Configuration Status */}
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>Configuration Status</h3>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Basic Configuration</span>
                  <CheckCircle2 className='h-4 w-4 text-green-600' />
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Listeners</span>
                  {formData.listeners && formData.listeners.length > 0 ? (
                    <Badge variant='outline' className='text-xs'>
                      {formData.listeners.length} configured
                    </Badge>
                  ) : (
                    <span className='text-xs text-muted-foreground'>None</span>
                  )}
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Policies</span>
                  {formData.policies && formData.policies.length > 0 ? (
                    <Badge variant='outline' className='text-xs'>
                      {formData.policies.length} configured
                    </Badge>
                  ) : (
                    <span className='text-xs text-muted-foreground'>None</span>
                  )}
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Pools</span>
                  {formData.pools && formData.pools.length > 0 ? (
                    <Badge variant='outline' className='text-xs'>
                      {formData.pools.length} configured
                    </Badge>
                  ) : (
                    <span className='text-xs text-muted-foreground'>None</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estimated Cost */}
          <div
            style={{
              borderRadius: '16px',
              border: '4px solid #FFF',
              background:
                'linear-gradient(265deg, #FFF -13.17%, #F7F8FD 133.78%)',
              boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)',
              padding: '1.5rem',
            }}
          >
            <div className='pb-4'>
              <h3 className='text-base font-semibold'>Estimated Cost</h3>
            </div>
            <div className='space-y-3'>
              <div className='flex items-baseline gap-2'>
                <span className='text-2xl font-bold'>₹1.20</span>
                <span className='text-sm text-muted-foreground'>per hour</span>
              </div>
              <p className='text-sm text-muted-foreground'>
                {getFullLoadBalancerTypeName(config)} with{' '}
                {config.infrastructureType === 'SW' ? 'software' : 'hardware'}{' '}
                infrastructure.
              </p>
              <div className='text-xs text-muted-foreground pt-2 border-t'>
                <p>• ALB Setup: ₹1.20/hour</p>
                <p>• Estimated monthly: ₹876.00</p>
                <p>• Data processing charges apply</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

function Label({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  );
}
