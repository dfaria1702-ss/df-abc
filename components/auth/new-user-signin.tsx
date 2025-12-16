'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function NewUserSignIn() {
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
    setErrors({});

    const newErrors: {
      email?: string;
      password?: string;
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

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Set authentication data
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
          <div className='bg-white rounded-lg p-8'>
            {/* Title and Description */}
            <div className='text-left mb-6'>
              <h2 className='text-2xl font-bold tracking-tight text-gray-900 mb-2'>
                Login to your account
              </h2>
              <p className='text-sm text-gray-600'>
                Enter your credentials to access your account
              </p>
            </div>

            {/* Form */}
            <form className='space-y-5' onSubmit={handleSubmit}>
              {errors.general && (
                <div className='rounded-md bg-red-50 p-4'>
                  <p className='text-sm text-red-700'>{errors.general}</p>
                </div>
              )}

              {/* Email Address */}
              <div>
                <Label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700'
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
                    className='block text-sm font-medium text-gray-700'
                  >
                    Password
                  </Label>
                  <Link
                    href='/auth/forgot-password'
                    className='text-sm font-medium text-gray-600 hover:text-gray-800'
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
            <div className='mt-6 text-left text-sm'>
              <div>
                <span className='text-gray-600'>Don&apos;t have an account? </span>
                <Link
                  href='/auth/signup'
                  className='font-medium text-primary hover:text-primary/80'
                >
                  Sign Up
                </Link>
              </div>
              <div className='mt-2'>
                <span className='text-gray-600'>Contact </span>
                <Link
                  href='/support'
                  className='font-medium text-primary hover:text-primary/80'
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

