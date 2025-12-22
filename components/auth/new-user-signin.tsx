'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function NewUserSignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'root' | 'iam'>('root');
  const [organisationId, setOrganisationId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<'root' | 'iam' | null>(null);
  const [errors, setErrors] = useState<{
    organisationId?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});

  // Check for userType in URL params and set it
  useEffect(() => {
    const userTypeParam = searchParams.get('userType');
    if (userTypeParam === 'iam') {
      setUserType('iam');
    }
  }, [searchParams]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: {
      organisationId?: string;
      email?: string;
      password?: string;
    } = {};

    if (userType === 'iam' && !organisationId.trim()) {
      newErrors.organisationId = 'Organisation ID is required for IAM users';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if IAM user - they should reset password on first login
      // In production, this would be determined by API response (e.g., passwordResetRequired flag)
      if (userType === 'iam') {
        // Store temporary session data for password reset flow
        const tempSession = {
          email: email,
          organisationId: organisationId,
          userType: 'iam',
          timestamp: Date.now(),
        };
        sessionStorage.setItem('temp_auth_session', JSON.stringify(tempSession));
        
        // Redirect to reset password page for IAM users
        router.push('/auth/reset-password-iam');
        return;
      }

      // Set authentication data for Root users
      const userInfo = {
        name: email.split('@')[0],
        email: email,
        mobile: '',
        accountType: 'individual',
        signinCompletedAt: new Date().toISOString(),
      };

      const authToken = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('auth-token', authToken);
      document.cookie = `auth-token=${authToken}; path=/; max-age=86400`;
      localStorage.setItem('user_data', JSON.stringify(userInfo));

      const profileStatus = {
        basicInfoComplete: true,
        identityVerified: true,
        paymentSetupComplete: true,
      };
      localStorage.setItem('user_profile_status', JSON.stringify(profileStatus));
      localStorage.setItem('accessLevel', 'full');

      window.location.replace('/dashboard');
    } catch (error) {
      console.error('Sign-in error:', error);
      setErrors({
        general: 'Invalid email or password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen'>
      {/* Left side - 40% - Image */}
      <div className='hidden lg:flex lg:w-[40%] relative bg-gradient-to-br from-green-50 to-green-100'>
        <Image
          src='/register-krutrim-cloud.png'
          alt='Krutrim Cloud Platform'
          fill
          className='object-cover'
          priority
        />
      </div>

      {/* Right side - 60% - Form Content */}
      <div className='flex w-full lg:w-[60%] flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8'>
        <div className='w-full max-w-md'>
          {/* Krutrim Logo */}
          <div className='flex justify-start mb-8'>
            <Image
              src='https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Krutrim%20Logo-YGvFj442htj2kpqEDlt4mjbOEIqtzX.png'
              alt='Krutrim'
              width={180}
              height={60}
              className='h-12'
            />
          </div>

          {/* Card Container */}
          <div className='bg-white rounded-lg'>
            {/* Title and Description */}
            <div className='text-left mb-6'>
              <h2 className='text-3xl font-semibold tracking-tight text-gray-900 mb-2'>
                Login to your account
              </h2>
              <p className='text-md text-gray-500'>
                Enter your credentials to access your account
              </p>
            </div>

            {/* Form */}
            <form className='space-y-5' onSubmit={handleSubmit}>
              {errors.general && (
                <div className='rounded-md bg-red-50 p-4'>
                  <p className='text-md text-red-700'>{errors.general}</p>
                </div>
              )}

              {/* User Type Toggle */}
              <div>
                <TooltipProvider delayDuration={200}>
                  <Switch 
                    name="userType" 
                    size="medium"
                    value={userType}
                    onValueChange={(value) => setUserType(value as 'root' | 'iam')}
                  >
                    <div
                      onMouseEnter={() => setHoveredTab('root')}
                      onMouseLeave={() => setHoveredTab(null)}
                      className="flex-1"
                    >
                      <Switch.Control
                        label={
                          <div className="flex items-center justify-center relative w-full">
                            <span>Root User</span>
                            {(userType === 'root' || hoveredTab === 'root') && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3.5 w-3.5 text-gray-500 absolute left-1/2 translate-x-[45px]" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-none whitespace-nowrap">
                                  <p>Choose this if you have created the organisation</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        }
                        value="root"
                        defaultChecked={userType === 'root'}
                      />
                    </div>
                    <div
                      onMouseEnter={() => setHoveredTab('iam')}
                      onMouseLeave={() => setHoveredTab(null)}
                      className="flex-1"
                    >
                      <Switch.Control
                        label={
                          <div className="flex items-center justify-center relative w-full">
                            <span>IAM User</span>
                            {(userType === 'iam' || hoveredTab === 'iam') && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3.5 w-3.5 text-gray-500 absolute left-1/2 translate-x-[40px]" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-none whitespace-nowrap">
                                  <p>Choose this if you were invited to the organisation</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        }
                        value="iam"
                        defaultChecked={userType === 'iam'}
                      />
                    </div>
                  </Switch>
                </TooltipProvider>
              </div>

              {/* Organisation ID - Only for IAM Users */}
              {userType === 'iam' && (
                <div>
                  <TooltipProvider delayDuration={200}>
                    <div className='flex items-center gap-1.5 mb-2'>
                      <Label
                        htmlFor='organisationId'
                        className='block text-sm text-gray-500'
                      >
                        Organisation ID
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>This identifies which organization you are signing into. Enter the Org ID shared with you when you were invited.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                  <Input
                    id='organisationId'
                    name='organisationId'
                    type='text'
                    value={organisationId}
                    onChange={e => setOrganisationId(e.target.value)}
                    className={cn(
                      'mt-1',
                      errors.organisationId && 'border-red-300 focus-visible:ring-red-500'
                    )}
                    placeholder='Enter your organisation ID'
                  />
                  {errors.organisationId && (
                    <p className='mt-1 text-sm text-red-600'>{errors.organisationId}</p>
                  )}
                </div>
              )}

              {/* Email Address */}
              <div>
                <Label
                  htmlFor='email'
                  className='block text-sm text-gray-500 mb-2'
                >
                  Email Address
                </Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={cn(
                    'mt-1',
                    errors.email && 'border-red-300 focus-visible:ring-red-500'
                  )}
                  placeholder='you@example.com'
                />
                {errors.email && (
                  <p className='mt-1 text-sm text-red-600'>{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className='flex items-center justify-between'>
                  <Label
                    htmlFor='password'
                    className='block text-sm text-gray-500 mb-2'
                  >
                    Password
                  </Label>
                  <Link
                    href='/auth/forgot-password'
                    className='text-sm font-medium text-gray-600 hover:text-gray-800 mb-2'
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className='relative mt-1'>
                  <Input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='current-password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={cn(
                      'pr-10',
                      errors.password && 'border-red-300 focus-visible:ring-red-500'
                    )}
                    placeholder='••••••••'
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className='mt-1 text-sm text-red-600'>{errors.password}</p>
                )}
              </div>

              {/* Sign In Button */}
              <Button
                type='submit'
                className='w-full bg-primary hover:bg-primary/90 text-white'
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Footer Links */}
            <div className='mt-6 text-center text-sm'>
              <div>
                <span className='text-[#7F7F7F]'>Don&apos;t have an account? </span>
                <Link
                  href='/auth/signup'
                  className='font-medium text-[#4CAF50] hover:text-[#4CAF50]/80'
                >
                  Sign Up
                </Link>
              </div>
              <div className='mt-2'>
                <span className='text-[#7F7F7F]'>Contact </span>
                <Link
                  href='/support'
                  className='font-medium text-[#4CAF50] hover:text-[#4CAF50]/80'
                >
                  Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

