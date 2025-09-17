'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/page-layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Tag {
  key: string;
  value: string;
}

export default function CreateBucketPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    bucketName: '',
    region: '',
    accessControl: '',
    bucketVersioning: false,
    defaultEncryption: true,
  });
  const [tags, setTags] = useState<Tag[]>([]);
  const [formTouched, setFormTouched] = useState(false);

  const handleChange = (name: string, value: string | boolean) => {
    setFormTouched(true);
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = () => {
    setTags([...tags, { key: '', value: '' }]);
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleTagChange = (index: number, field: 'key' | 'value', value: string) => {
    const newTags = [...tags];
    newTags[index][field] = value;
    setTags(newTags);
  };

  const isFormValid = () => {
    const hasValidBucketName = formData.bucketName.trim().length >= 3;
    const hasValidRegion = formData.region.length > 0;
    const hasValidAccessControl = formData.accessControl.length > 0;
    return hasValidBucketName && hasValidRegion && hasValidAccessControl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormTouched(true);

    if (!isFormValid()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Bucket created successfully',
        description: `${formData.bucketName} has been created in ${formData.region}.`,
      });

      router.push('/storage/object');
    } catch (error) {
      toast({
        title: 'Failed to create bucket',
        description: 'An error occurred while creating the bucket.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/storage/object');
  };

  return (
    <PageLayout
      title='Create Bucket'
      description='Configure and create a new object storage bucket'
    >
      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Main Content */}
        <div className='flex-1 space-y-6'>
          <Card>
            <CardContent className='space-y-6 pt-6'>
              <form onSubmit={handleSubmit}>
                {/* Bucket Name */}
                <div className='mb-6'>
                  <Label htmlFor='bucketName' className='block mb-2 font-medium'>
                    Bucket Name <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='bucketName'
                    placeholder='Enter your bucket name'
                    value={formData.bucketName}
                    onChange={(e) => handleChange('bucketName', e.target.value)}
                    className={`focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      formTouched && formData.bucketName.trim().length < 3
                        ? 'border-red-300 bg-red-50'
                        : ''
                    }`}
                    required
                  />
                  <p className='text-xs text-muted-foreground mt-1'>
                    Minimum 3 characters and bucket name must be unique within the global namespace and follow the{' '}
                    <span className='text-primary cursor-pointer hover:underline'>
                      Bucket Naming Rules
                    </span>
                  </p>
                </div>

                {/* Region */}
                <div className='mb-6'>
                  <Label htmlFor='region' className='block mb-2 font-medium'>
                    Region <span className='text-destructive'>*</span>
                  </Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => handleChange('region', value)}
                  >
                    <SelectTrigger
                      className={`${
                        formTouched && !formData.region
                          ? 'border-red-300 bg-red-50'
                          : ''
                      }`}
                    >
                      <SelectValue placeholder='Select a region' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='us-east-1'>US East (N. Virginia)</SelectItem>
                      <SelectItem value='us-west-2'>US West (Oregon)</SelectItem>
                      <SelectItem value='eu-west-1'>Europe (Ireland)</SelectItem>
                      <SelectItem value='ap-south-1'>Asia Pacific (Mumbai)</SelectItem>
                      <SelectItem value='ap-southeast-1'>Asia Pacific (Singapore)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Access Control */}
                <div className='mb-6'>
                  <Label htmlFor='accessControl' className='block mb-2 font-medium'>
                    Access Control <span className='text-destructive'>*</span>
                  </Label>
                  <Select
                    value={formData.accessControl}
                    onValueChange={(value) => handleChange('accessControl', value)}
                  >
                    <SelectTrigger
                      className={`${
                        formTouched && !formData.accessControl
                          ? 'border-red-300 bg-red-50'
                          : ''
                      }`}
                    >
                      <SelectValue placeholder='Select Access Control' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='private'>Private</SelectItem>
                      <SelectItem value='public-read'>Public Read</SelectItem>
                      <SelectItem value='public-read-write'>Public Read/Write</SelectItem>
                      <SelectItem value='authenticated-read'>Authenticated Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bucket Versioning */}
                <div className='mb-6'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label className='font-medium'>Bucket Versioning</Label>
                      <p className='text-sm text-muted-foreground'>
                        Store different versions of the same object without losing
                      </p>
                    </div>
                    <Switch
                      checked={formData.bucketVersioning}
                      onCheckedChange={(checked) => handleChange('bucketVersioning', checked)}
                    />
                  </div>
                  {formData.bucketVersioning && (
                    <div className='mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md'>
                      <p className='text-sm text-blue-800'>
                        <strong>Note:</strong> Once you enable Bucket Versioning you can't disable it
                      </p>
                    </div>
                  )}
                </div>

                {/* Default Encryption */}
                <div className='mb-6'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label className='font-medium'>Default Encryption</Label>
                      <p className='text-sm text-muted-foreground'>
                        Server-side encryption is automatically applied to new objects stored in this bucket.
                      </p>
                    </div>
                    <Switch
                      checked={formData.defaultEncryption}
                      onCheckedChange={(checked) => handleChange('defaultEncryption', checked)}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className='mb-6'>
                  <div className='flex items-center justify-between mb-3'>
                    <div>
                      <Label className='font-medium'>Tags (optional)</Label>
                      <p className='text-sm text-muted-foreground'>
                        You can use bucket tags to track storage costs and organize buckets
                      </p>
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={handleAddTag}
                      className='flex items-center gap-2'
                    >
                      <Plus className='h-4 w-4' />
                      Add Tag
                    </Button>
                  </div>

                  {tags.length > 0 && (
                    <div className='space-y-3'>
                      {tags.map((tag, index) => (
                        <div key={index} className='flex gap-3 items-center'>
                          <Input
                            placeholder='Key'
                            value={tag.key}
                            onChange={(e) => handleTagChange(index, 'key', e.target.value)}
                            className='flex-1'
                          />
                          <Input
                            placeholder='Value'
                            value={tag.value}
                            onChange={(e) => handleTagChange(index, 'value', e.target.value)}
                            className='flex-1'
                          />
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => handleRemoveTag(index)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className='flex justify-end gap-3 pt-6'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    disabled={!isFormValid()}
                    className='bg-black hover:bg-gray-800'
                  >
                    Create Bucket
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Tips Sidebar */}
        <div className='w-full lg:w-80 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base font-normal'>
                Configuration Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className='space-y-3'>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span
                    className='text-muted-foreground'
                    style={{ fontSize: '13px' }}
                  >
                    Choose a descriptive bucket name for easy identification
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span
                    className='text-muted-foreground'
                    style={{ fontSize: '13px' }}
                  >
                    Select the region closest to your users for better performance
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span
                    className='text-muted-foreground'
                    style={{ fontSize: '13px' }}
                  >
                    Use private access control for better security
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span
                    className='text-muted-foreground'
                    style={{ fontSize: '13px' }}
                  >
                    Plan your versioning strategy to avoid storage conflicts
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Price Summary */}
          <div
            style={{
              borderRadius: '16px',
              border: '4px solid #FFF',
              background: 'linear-gradient(265deg, #FFF -13.17%, #F7F8FD 133.78%)',
              boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)',
              padding: '1.5rem'
            }}
          >
            <div className="pb-4">
              <h3 className="text-base font-semibold">Price Summary</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">0 to 5GB</span>
                  <div className="text-right">
                    <div className="font-medium">₹0.00 /GB</div>
                    <div className="text-xs text-muted-foreground">₹0.00000000000 /credit</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">5 GB to 50 TB</span>
                  <div className="text-right">
                    <div className="font-medium">₹1.66 /GB</div>
                    <div className="text-xs text-muted-foreground">₹0.00230555556 /credit</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">50 TB to 500 TB</span>
                  <div className="text-right">
                    <div className="font-medium">₹1.61 /GB</div>
                    <div className="text-xs text-muted-foreground">₹0.00223611111 /credit</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Above 500 TB</span>
                  <div className="text-right">
                    <div className="font-medium">₹1.54 /GB</div>
                    <div className="text-xs text-muted-foreground">₹0.00213888889 /credit</div>
                  </div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className='flex items-start gap-2'>
                    <span>•</span>
                    <span>Pricing is per GB per month</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span>•</span>
                    <span>Billed based on actual usage (post-usage)</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span>•</span>
                    <span>First 5GB is free every month</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span>•</span>
                    <span>Credit rates shown for billing cycle calculations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
