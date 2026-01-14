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

interface NLBProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onSuccess: () => void;
}

export function NLBProgressModal({
  isOpen,
  onClose,
  taskId,
  onSuccess,
}: NLBProgressModalProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<ProgressStep[]>([
    { id: 'create-port', name: 'Create Port', status: 'not-started' },
    {
      id: 'create-loadbalancer',
      name: 'Create Load Balancer',
      status: 'not-started',
    },
    { id: 'create-listener', name: 'Create Listener 1', status: 'not-started' },
  ]);

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
        return prev + Math.random() * 15; // Random increment for realistic progress
      });
    }, 800);

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
    }, 1000);

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
        return <Clock className='h-4 w-4 text-blue-600 animate-pulse' />;
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
        return 'text-blue-700';
      case 'failed':
        return 'text-red-700';
      default:
        return 'text-gray-500';
    }
  };

  const getStepStatusText = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return 'completed';
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
            Load Balancer creating is in progress. Please wait...
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
          {/* Task ID */}
          <div className='text-sm text-gray-600'>
            <span className='font-medium'>Task id:</span> {taskId}
          </div>

          {/* Warning Message */}
          <div className='p-3 bg-orange-50 border border-orange-200 rounded-lg'>
            <p className='text-sm text-orange-700'>
              Load balancer creation is in progress. If you close this window,
              it might not be listed until the process completes successfully or
              fails in the background.
            </p>
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
                    {step.name}: {getStepStatusText(step.status)}
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
