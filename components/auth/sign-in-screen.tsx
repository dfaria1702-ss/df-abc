'use client';

import type React from 'react';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Github } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function SignInScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validate form
    const newErrors: {
      email?: string;
      password?: string;
      general?: string;
    } = {};

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

    // Proceed with sign in
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Set authentication data in localStorage
      let userType: 'existing' | 'new' | 'regular' = 'regular';

      // Determine user type based on demo credentials
      if (email === 'existing.user@krutrim.com') {
        userType = 'existing';
      } else if (email === 'new.user@krutrim.com') {
        userType = 'new';
      }

      const userInfo = {
        name: email.split('@')[0],
        email: email,
        mobile: '',
        accountType: userType === 'new' ? 'individual' : 'organization', // Set based on userType
        signinCompletedAt: new Date().toISOString(),
        userType: userType,
        credits: userType === 'new' ? 0 : 1000, // New users have 0 credits, existing users have 1000 credits
      };

      // Set auth token
      const authToken = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('auth-token', authToken);

      // Set auth cookie for middleware
      document.cookie = `auth-token=${authToken}; path=/; max-age=86400`;

      // Set user data
      localStorage.setItem('user_data', JSON.stringify(userInfo));

      // Set profile status
      const profileStatus = {
        basicInfoComplete: true,
        identityVerified: true,
        paymentSetupComplete: true,
      };
      localStorage.setItem(
        'user_profile_status',
        JSON.stringify(profileStatus)
      );

      // Set access level
      localStorage.setItem('accessLevel', 'full');

      // Get redirect URL from query params or default to dashboard
      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get('redirect') || '/dashboard';

      // Use Next.js router for navigation
      window.location.replace(redirectUrl);
    } catch (error) {
      console.error('Sign-in error:', error);
      setErrors({
        general: 'Invalid email or password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update the return statement to use a card container
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md'>
        <div className='flex flex-col items-center mb-6'>
          {/* Krutrim Logo */}
          <div className='mb-4 flex justify-center'>
            <Image
              src='https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Krutrim%20Logo-YGvFj442htj2kpqEDlt4mjbOEIqtzX.png'
              alt='Krutrim'
              width={180}
              height={60}
              className='h-12'
            />
          </div>
        </div>

        {/* Add Card Container */}
        <div className='bg-white shadow-md rounded-lg p-8'>
          <h2 className='text-center text-2xl font-bold tracking-tight text-gray-900 mb-6'>
            Sign in to Krutrim Cloud
          </h2>

          <form className='space-y-6' onSubmit={handleSubmit}>
            {errors.general && (
              <div className='rounded-md bg-red-50 p-4'>
                <p className='text-sm text-red-700'>{errors.general}</p>
              </div>
            )}

            <div className='space-y-4'>
              <div>
                <Label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700'
                >
                  Email address
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

              <div>
                <div className='flex items-center justify-between'>
                  <Label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Password
                  </Label>
                  <Link
                    href='/auth/forgot-password'
                    className='text-sm font-medium text-primary hover:text-primary/80'
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
                      errors.password &&
                        'border-red-300 focus-visible:ring-red-500'
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
            </div>

            <div className='flex gap-3'>
              <Button
                type='submit'
                className='group relative flex-1 justify-center'
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Button
                type='button'
                variant='outline'
                className='flex-1'
                onClick={() => router.push('/auth/new-signin')}
              >
                New Sign In
              </Button>
            </div>

            {/* Demo Credentials Section */}
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <Separator className='w-full' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='bg-white px-2 text-gray-500'>
                  Or try demo credentials
                </span>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <Button
                type='button'
                variant='outline'
                className='w-full text-left'
                onClick={() => {
                  setEmail('existing.user@krutrim.com');
                  setPassword('demo123!');
                }}
              >
                <div className='flex flex-col items-start'>
                  <span className='font-medium text-sm'>Existing User</span>
                  <span className='text-xs text-gray-500'>
                    With sample data
                  </span>
                </div>
              </Button>
              <Button
                type='button'
                variant='outline'
                className='w-full text-left'
                onClick={() => {
                  setEmail('new.user@krutrim.com');
                  setPassword('demo123!');
                }}
              >
                <div className='flex flex-col items-start'>
                  <span className='font-medium text-sm'>New User</span>
                  <span className='text-xs text-gray-500'>Empty states</span>
                </div>
              </Button>
            </div>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <Separator className='w-full' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='bg-white px-2 text-gray-500'>
                  Or continue with
                </span>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <Button
                variant='outline'
                type='button'
                className='w-full'
                onClick={() => router.push('/auth/google')}
              >
                <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
                  <path
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    fill='#4285F4'
                  />
                  <path
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    fill='#34A853'
                  />
                  <path
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    fill='#FBBC05'
                  />
                  <path
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    fill='#EA4335'
                  />
                  <path d='M1 1h22v22H1z' fill='none' />
                </svg>
                Google
              </Button>
              <Button
                variant='outline'
                type='button'
                className='w-full'
                onClick={() => router.push('/auth/github')}
              >
                <Github className='mr-2 h-4 w-4' />
                GitHub
              </Button>
            </div>
          </form>

          <div className='text-center text-sm mt-6'>
            Don&apos;t have an account?{' '}
            <Link
              href='/auth/signup'
              className='font-medium text-primary hover:text-primary/80'
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
