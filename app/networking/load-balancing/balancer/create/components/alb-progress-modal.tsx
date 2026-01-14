'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProgressStep {
  id: string;
  name: string;
  status: 'not-started' | 'pending' | 'completed' | 'failed';
}

interface ALBProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onSuccess: () => void;
  formData?: any; // ALB form data to extract target group and policy names
}

export function ALBProgressModal({
  isOpen,
  onClose,
  taskId,
  onSuccess,
  formData,
}: ALBProgressModalProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Generate dynamic steps based on form data
  const generateSteps = (): ProgressStep[] => {
    const steps: ProgressStep[] = [
      { id: 'create-port', name: 'Create Port', status: 'not-started' },
      {
        id: 'create-loadbalancer',
        name: 'Create Load Balancer',
        status: 'not-started',
      },
      {
        id: 'create-listener',
        name: 'Create Listener 1',
        status: 'not-started',
      },
    ];

    // Add target group steps if form data is available
    if (formData?.listeners) {
      formData.listeners.forEach((listener: any, listenerIndex: number) => {
        if (listener.pools) {
          listener.pools.forEach((pool: any, poolIndex: number) => {
            if (pool.targetGroup) {
              // Extract target group name from the selected value
              const targetGroupName =
                pool.targetGroup || `TargetGroup-${poolIndex + 1}`;
              steps.push(
                {
                  id: `targetgroup-${poolIndex}`,
                  name: `${targetGroupName}: pending`,
                  status: 'not-started',
                },
                {
                  id: `healthmonitor-${poolIndex}`,
                  name: `${targetGroupName} Health Monitor: not started`,
                  status: 'not-started',
                },
                {
                  id: `member1-${poolIndex}`,
                  name: `${targetGroupName} Member 1: not started`,
                  status: 'not-started',
                },
                {
                  id: `member2-${poolIndex}`,
                  name: `${targetGroupName} Member 2: not started`,
                  status: 'not-started',
                }
              );
            }
          });
        }

        // Add policy steps if available
        if (listener.policies) {
          listener.policies.forEach((policy: any, policyIndex: number) => {
            if (policy.name) {
              steps.push({
                id: `policy-${listenerIndex}-${policyIndex}`,
                name: `Listener ${listenerIndex + 1} Policy ${policyIndex + 1}: not started`,
                status: 'not-started',
              });
            }
          });
        }
      });
    }

    // If no form data, use default steps
    if (steps.length === 3) {
      steps.push(
        {
          id: 'targetgroup-1',
          name: 'Demo-TargetGroup-3: pending',
          status: 'not-started',
        },
        {
          id: 'healthmonitor-1',
          name: 'Demo-TargetGroup-3 Health Monitor: not started',
          status: 'not-started',
        },
        {
          id: 'member1-1',
          name: 'Demo-TargetGroup-3 Member 1: not started',
          status: 'not-started',
        },
        {
          id: 'member2-1',
          name: 'Demo-TargetGroup-3 Member 2: not started',
          status: 'not-started',
        },
        {
          id: 'policy-1',
          name: 'Listener 1 Policy 1: not started',
          status: 'not-started',
        }
      );
    }

    return steps;
  };

  const [steps, setSteps] = useState<ProgressStep[]>(generateSteps());

  // Update steps when form data changes
  useEffect(() => {
    setSteps(generateSteps());
  }, [formData]);

  // Simulate progress updates
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // All steps completed, redirect after a short delay
          setTimeout(() => {
            onSuccess();
            router.push('/networking/load-balancing');
          }, 1000);
          return 100;
        }
        return prev + Math.random() * 8; // Slower progress for more steps
      });
    }, 1000);

    // Update steps based on progress
    const stepInterval = setInterval(() => {
      setSteps(prev => {
        const newSteps = [...prev];
        const progressPercent = progress / 100;
        const stepIndex = Math.floor(progressPercent * newSteps.length);

        newSteps.forEach((step, index) => {
          if (index < stepIndex) {
            step.status = 'completed';
          } else if (index === stepIndex) {
            step.status = 'pending';
          } else {
            step.status = 'not-started';
          }
        });

        return newSteps;
      });
    }, 1200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isOpen, progress, onSuccess, router]);

  const getStepIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'pending':
        return <Clock className='h-4 w-4 text-orange-600 animate-pulse' />;
      case 'failed':
        return <AlertCircle className='h-4 w-4 text-red-600' />;
      default:
        return (
          <div className='h-4 w-4 rounded-full border-2 border-gray-300' />
        );
    }
  };

  const getStepTextColor = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-700';
      case 'pending':
        return 'text-orange-600';
      case 'failed':
        return 'text-red-700';
      default:
        return 'text-gray-500';
    }
  };

  const getStepStatusText = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'pending';
      case 'failed':
        return 'failed';
      default:
        return 'not started';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Load Balancer creating is in progress.
          </h2>
          <Button
            variant='ghost'
            size='sm'
            onClick={onClose}
            className='h-6 w-6 p-0 hover:bg-gray-100'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>

        <div className='space-y-4'>
          <p className='text-sm text-gray-600'>Please wait...</p>

          {/* Task ID */}
          <div className='text-sm text-gray-600'>
            <span className='font-medium'>Task id:</span> {taskId}
          </div>

          {/* Progress Steps */}
          <div className='space-y-3'>
            {steps.map((step, index) => (
              <div key={step.id} className='flex items-center space-x-3'>
                {getStepIcon(step.status)}
                <div className='flex-1'>
                  <span
                    className={`text-sm font-medium ${getStepTextColor(step.status)}`}
                  >
                    {step.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className='space-y-2'>
            <div className='flex justify-between text-xs text-gray-500'>
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out'
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
