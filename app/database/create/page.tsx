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
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Checkbox } from '../../../components/ui/checkbox';
import { Slider } from '../../../components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion';
import { TooltipWrapper } from '../../../components/ui/tooltip-wrapper';
import { HelpCircle, Copy, Check } from 'lucide-react';
import { vpcs, subnets } from '../../../lib/data';

// Mock data for storage buckets
const storageBuckets = [
  { value: 'prod-backups-us-east', label: 'prod-backups-us-east' },
  { value: 'dev-backups-us-west', label: 'dev-backups-us-west' },
  { value: 'staging-backups-eu', label: 'staging-backups-eu' },
  { value: 'db-backups-primary', label: 'db-backups-primary' },
];

// Configuration tiers
const configurationTiers = [
  {
    id: 'tier-1',
    price: 107.0,
    vcpu: 2,
    ram: 4,
    storage: 40,
    iops: { read: 3000, write: 1000 },
    description: 'Small workloads, low traffic, prototypes',
  },
  {
    id: 'tier-2',
    price: 212.0,
    vcpu: 4,
    ram: 8,
    storage: 100,
    iops: { read: 6000, write: 3000 },
    description: 'Early production, moderate traffic, few users',
  },
  {
    id: 'tier-3',
    price: 412.0,
    vcpu: 8,
    ram: 16,
    storage: 200,
    iops: { read: 12000, write: 6000 },
    description: 'Production workloads, analytics',
  },
  {
    id: 'tier-4',
    price: 827.0,
    vcpu: 16,
    ram: 32,
    storage: 400,
    iops: { read: 24000, write: 12000 },
    description: 'High traffic, production-critical, large concurrent queries',
  },
];

// Quick select storage options
const storageQuickSelect = [
  { label: '20GB', value: 20 },
  { label: '100GB', value: 100 },
  { label: '500GB', value: 500 },
  { label: '1TB', value: 1024 },
];

export default function CreateDatabasePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    dbType: 'relational',
    engine: 'mysql',
    version: '',
    configuration: '',
    storageSize: 100,
    storageAutoscaling: false,
    replicaConfig: 'no-standby',
    databaseName: '',
    username: '',
    password: '',
    vpc: '',
    subnet: '',
    // Backup fields
    backupName: '',
    storageBucket: '',
    maxBackups: 7,
    customMaxBackups: '',
    backupMinute: '',
    backupHour: '',
    backupDay: '',
    backupMonth: '',
    backupWeekday: '',
  });

  const [formTouched, setFormTouched] = useState(false);
  const [customStorageInput, setCustomStorageInput] = useState('');
  const [cronCopied, setCronCopied] = useState(false);

  // Get subnets for selected VPC
  const selectedVpc = vpcs.find(vpc => vpc.id === formData.vpc);
  const selectedVpcSubnets = selectedVpc
    ? subnets.filter(subnet => subnet.vpcName === selectedVpc.name)
    : [];

  // Calculate storage price (₹1.80 per GB per month)
  const storagePrice = (formData.storageSize * 1.8).toFixed(2);

  // Calculate total estimated monthly cost
  const calculateTotalCost = () => {
    const configCost =
      configurationTiers.find(tier => tier.id === formData.configuration)
        ?.price || 0;
    const storageCost = parseFloat(storagePrice);
    let replicaCost = 0;

    if (formData.replicaConfig === 'one-standby') {
      replicaCost = 231.35;
    } else if (formData.replicaConfig === 'two-standby') {
      replicaCost = 462.7;
    }

    return (configCost + storageCost + replicaCost).toFixed(2);
  };

  // Generate CRON expression
  const generateCronExpression = () => {
    const minute = formData.backupMinute || '*';
    const hour = formData.backupHour || '*';
    const day = formData.backupDay || '*';
    const month = formData.backupMonth || '*';
    const weekday = formData.backupWeekday || '*';
    return `${minute} ${hour} ${day} ${month} ${weekday}`;
  };

  const handleCopyCron = () => {
    navigator.clipboard.writeText(generateCronExpression());
    setCronCopied(true);
    setTimeout(() => setCronCopied(false), 2000);
  };

  // Form validation
  const isFormValid = () => {
    return (
      formData.engine &&
      formData.version &&
      formData.configuration &&
      formData.databaseName.trim().length > 0 &&
      formData.username.trim().length > 0 &&
      formData.password.trim().length > 0 &&
      formData.vpc &&
      formData.subnet
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (!formTouched) setFormTouched(true);
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (!formTouched) setFormTouched(true);
  };

  const handleStorageQuickSelect = (value: number) => {
    setFormData(prev => ({ ...prev, storageSize: value }));
    setCustomStorageInput('');
  };

  const handleCustomStorageApply = () => {
    const value = parseInt(customStorageInput);
    if (!isNaN(value) && value >= 4 && value <= 2048) {
      setFormData(prev => ({ ...prev, storageSize: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      console.log('Creating database with data:', formData);
      // Mock API call
      setTimeout(() => {
        router.push('/database');
      }, 1000);
    }
  };

  return (
    <PageLayout
      title='Create Database'
      description='Configure your new managed database instance'
    >
      <div className='flex flex-col md:flex-row gap-6'>
        {/* Main Form */}
        <div className='flex-1 min-w-0'>
          <Card>
            <CardContent className='pt-6'>
              <form onSubmit={handleSubmit}>
                {/* Database Type Selection */}
                <div className='mb-8'>
                  <Card className='bg-muted/30'>
                    <CardContent className='pt-6'>
                      <h3 className='text-base font-semibold mb-4'>
                        Select DB Engine and Version
                      </h3>
                      <RadioGroup
                        value={formData.dbType}
                        onValueChange={value =>
                          handleSelectChange('dbType', value)
                        }
                        className='flex gap-8'
                      >
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='relational' id='relational' />
                          <Label
                            htmlFor='relational'
                            className='font-medium cursor-pointer'
                          >
                            Relational Databases
                          </Label>
                        </div>
                        <div className='flex items-center space-x-2 opacity-50'>
                          <RadioGroupItem
                            value='nosql'
                            id='nosql'
                            disabled
                          />
                          <Label htmlFor='nosql' className='font-medium'>
                            NoSQL Databases
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  {formData.dbType === 'relational' && (
                    <Card className='mt-6'>
                      <CardContent className='pt-6'>
                        <RadioGroup
                          value={formData.engine}
                          onValueChange={value => handleSelectChange('engine', value)}
                          className='grid grid-cols-2 gap-6'
                        >
                          {/* MySQL */}
                          <div className='flex items-center gap-3'>
                            <RadioGroupItem value='mysql' id='mysql' />
                            <Label
                              htmlFor='mysql'
                              className='flex items-center gap-2 font-medium cursor-pointer'
                            >
                              <span className='text-xl'>🐬</span>
                              <span>MySQL</span>
                            </Label>
                            <Select
                              value={formData.engine === 'mysql' ? formData.version : ''}
                              onValueChange={value => {
                                handleSelectChange('engine', 'mysql');
                                handleSelectChange('version', value);
                              }}
                              disabled={formData.engine !== 'mysql'}
                            >
                              <SelectTrigger className='w-[140px]'>
                                <SelectValue placeholder='Version' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='8.0.35'>8.0.35</SelectItem>
                                <SelectItem value='8.0.33'>8.0.33</SelectItem>
                                <SelectItem value='8.0.32'>8.0.32</SelectItem>
                                <SelectItem value='5.7.42'>5.7.42</SelectItem>
                                <SelectItem value='5.7.40'>5.7.40</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* PostgreSQL */}
                          <div className='flex items-center gap-3'>
                            <RadioGroupItem value='postgresql' id='postgresql' />
                            <Label
                              htmlFor='postgresql'
                              className='flex items-center gap-2 font-medium cursor-pointer'
                            >
                              <span className='text-xl'>🐘</span>
                              <span>PostgreSQL</span>
                            </Label>
                            <Select
                              value={
                                formData.engine === 'postgresql' ? formData.version : ''
                              }
                              onValueChange={value => {
                                handleSelectChange('engine', 'postgresql');
                                handleSelectChange('version', value);
                              }}
                              disabled={formData.engine !== 'postgresql'}
                            >
                              <SelectTrigger className='w-[140px]'>
                                <SelectValue placeholder='Version' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='15.4'>15.4</SelectItem>
                                <SelectItem value='15.3'>15.3</SelectItem>
                                <SelectItem value='14.9'>14.9</SelectItem>
                                <SelectItem value='14.8'>14.8</SelectItem>
                                <SelectItem value='13.12'>13.12</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </RadioGroup>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Select Configuration */}
                <div className='mb-8'>
                  <div className='mb-4'>
                    <h3 className='text-base font-semibold mb-2'>
                      Select Configuration
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Choose a performance tier based on your CPU, memory, and storage
                      requirements. Higher tiers provide better performance for demanding
                      workloads.
                    </p>
                  </div>

                  <RadioGroup
                    value={formData.configuration}
                    onValueChange={value =>
                      handleSelectChange('configuration', value)
                    }
                    className='space-y-3'
                  >
                    {configurationTiers.map(tier => (
                      <div
                        key={tier.id}
                        className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.configuration === tier.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleSelectChange('configuration', tier.id)}
                      >
                        <RadioGroupItem
                          value={tier.id}
                          id={tier.id}
                          className='mt-1'
                        />
                        <div className='ml-3 flex-1'>
                          <div className='flex items-start justify-between'>
                            <div>
                              <Label
                                htmlFor={tier.id}
                                className='text-base font-semibold cursor-pointer'
                              >
                                ₹{tier.price.toFixed(2)}/mo
                              </Label>
                              <p className='text-sm text-muted-foreground mt-1'>
                                {tier.vcpu} vCPU / {tier.ram} GB RAM / Storage minimum:{' '}
                                {tier.storage} GB
                              </p>
                              <p className='text-xs text-muted-foreground mt-1'>
                                {tier.description}
                              </p>
                            </div>
                            <div className='text-right text-xs text-muted-foreground'>
                              <div className='font-medium text-foreground mb-1'>
                                IOPS
                              </div>
                              <div>Read: {tier.iops.read.toLocaleString()}</div>
                              <div>Write: {tier.iops.write.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Select Storage */}
                <div className='mb-8'>
                  <div className='mb-4'>
                    <h3 className='text-base font-semibold mb-2'>Select Storage</h3>
                    <p className='text-sm text-muted-foreground'>
                      Configure your storage capacity. Larger storage allows for more data
                      and better performance for data-intensive operations.
                    </p>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <Label className='mb-3 block text-sm font-medium'>
                        Size (GB) *
                      </Label>
                      <div className='flex gap-2 mb-4'>
                        <div className='text-sm font-medium'>Quick Select</div>
                        {storageQuickSelect.map(option => (
                          <Button
                            key={option.value}
                            type='button'
                            variant={
                              formData.storageSize === option.value
                                ? 'default'
                                : 'outline'
                            }
                            size='sm'
                            onClick={() => handleStorageQuickSelect(option.value)}
                            className='rounded-full'
                          >
                            {option.label}
                          </Button>
                        ))}
                        <div className='flex items-center gap-2'>
                          <Input
                            type='number'
                            placeholder='Custom'
                            value={customStorageInput}
                            onChange={e => setCustomStorageInput(e.target.value)}
                            className='w-24 h-9'
                            min={4}
                            max={2048}
                          />
                          <span className='text-sm text-muted-foreground'>GB</span>
                        </div>
                        {customStorageInput && (
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={handleCustomStorageApply}
                          >
                            Apply
                          </Button>
                        )}
                      </div>

                      <Slider
                        value={[formData.storageSize]}
                        onValueChange={([value]) =>
                          handleSelectChange('storageSize', value.toString())
                        }
                        min={4}
                        max={2048}
                        step={1}
                        className='mb-2'
                      />
                      <div className='flex justify-between text-xs text-muted-foreground'>
                        <span>4 GB</span>
                        <span>2048 GB</span>
                      </div>
                    </div>

                    <div className='flex items-center justify-between p-4 bg-muted/30 rounded-lg'>
                      <div className='text-sm font-medium'>
                        {formData.storageSize} GB Selected
                      </div>
                      <div className='text-right'>
                        <div className='text-base font-semibold'>
                          ₹{storagePrice}/mo
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          ₹{(parseFloat(storagePrice) / 730).toFixed(2)}/hour
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className='border-t my-8'></div>

                {/* Storage Autoscaling */}
                <div className='mb-8'>
                  <div className='mb-4'>
                    <h3 className='text-base font-semibold mb-2'>
                      Storage Autoscaling
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Automatically scale storage at a price-per-unit level when storage
                      reaches the threshold. Storage will increase incrementally as needed.
                    </p>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='storageAutoscaling'
                      checked={formData.storageAutoscaling}
                      onCheckedChange={checked =>
                        setFormData(prev => ({
                          ...prev,
                          storageAutoscaling: checked as boolean,
                        }))
                      }
                    />
                    <Label
                      htmlFor='storageAutoscaling'
                      className='text-sm font-medium cursor-pointer'
                    >
                      Enable Storage Autoscaling
                    </Label>
                  </div>
                </div>

                {/* Divider */}
                <div className='border-t my-8'></div>

                {/* Replica Configuration */}
                <div className='mb-8'>
                  <div className='mb-4'>
                    <h3 className='text-base font-semibold mb-2'>
                      Replica Configuration
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Choose your preferred cluster setup based on redundancy and
                      performance needs. Higher replica counts provide better availability
                      and read scalability.
                    </p>
                  </div>

                  <div className='space-y-4'>
                    {/* High Availability */}
                    <div>
                      <div className='flex items-center justify-between mb-3'>
                        <div>
                          <div className='font-medium'>
                            Upgrade for high availability
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            99.95% uptime
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            Automatically replace the primary node in case of a failure,
                            ensuring your data stays available.
                          </div>
                        </div>
                        <div className='px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded'>
                          RECOMMENDED
                        </div>
                      </div>

                      <RadioGroup
                        value={formData.replicaConfig}
                        onValueChange={value =>
                          handleSelectChange('replicaConfig', value)
                        }
                        className='space-y-2'
                      >
                        <div className='flex items-center justify-between p-3 border rounded-lg'>
                          <div className='flex items-center gap-3'>
                            <RadioGroupItem
                              value='one-standby'
                              id='one-standby'
                            />
                            <Label
                              htmlFor='one-standby'
                              className='cursor-pointer flex items-center gap-2'
                            >
                              <span>Add one standby node</span>
                            </Label>
                          </div>
                          <div className='text-sm font-medium'>₹231.35/mo</div>
                        </div>

                        <div className='flex items-center justify-between p-3 border rounded-lg'>
                          <div className='flex items-center gap-3'>
                            <RadioGroupItem
                              value='two-standby'
                              id='two-standby'
                            />
                            <Label
                              htmlFor='two-standby'
                              className='cursor-pointer flex items-center gap-2'
                            >
                              <span>Add two standby nodes</span>
                            </Label>
                          </div>
                          <div className='text-sm font-medium'>₹462.70/mo</div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Automated Failover */}
                    <div>
                      <div className='flex items-center justify-between mb-3'>
                        <div>
                          <div className='font-medium'>Automated failover</div>
                          <div className='text-xs text-muted-foreground'>
                            99.5% uptime guarantee
                          </div>
                        </div>
                      </div>

                      <RadioGroup
                        value={formData.replicaConfig}
                        onValueChange={value =>
                          handleSelectChange('replicaConfig', value)
                        }
                      >
                        <div className='flex items-center justify-between p-3 border rounded-lg bg-primary/5'>
                          <div className='flex items-center gap-3'>
                            <RadioGroupItem
                              value='no-standby'
                              id='no-standby'
                            />
                            <Label
                              htmlFor='no-standby'
                              className='cursor-pointer flex items-center gap-2'
                            >
                              <span>No standby node</span>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className='border-t my-8'></div>

                {/* Database Details */}
                <div className='mb-8'>
                  <div className='mb-4'>
                    <h3 className='text-base font-semibold mb-2'>Database Details</h3>
                    <p className='text-sm text-muted-foreground'>
                      Set your database credentials. These will be used to connect to your
                      database instance. Keep your password secure.
                    </p>
                  </div>

                  <div className='space-y-5'>
                    <div>
                      <Label htmlFor='databaseName' className='mb-2 block font-medium'>
                        Database Name *
                      </Label>
                      <Input
                        id='databaseName'
                        placeholder='my_prod_action_db'
                        value={formData.databaseName}
                        onChange={handleChange}
                        className='focus:ring-2 focus:ring-ring focus:ring-offset-2'
                      />
                    </div>

                    <div>
                      <div className='flex items-center gap-2 mb-2'>
                        <Label htmlFor='username' className='font-medium'>
                          Username *
                        </Label>
                        <TooltipWrapper
                          content={
                            <div className='space-y-2'>
                              <p className='font-medium'>Username Guidelines</p>
                              <p>
                                Choose a username for your database administrator account.
                              </p>
                              <ul className='list-disc pl-4 space-y-1'>
                                <li>Must start with a letter</li>
                                <li>Can contain letters, numbers, and underscores</li>
                                <li>Cannot be reserved keywords (admin, root, etc.)</li>
                              </ul>
                            </div>
                          }
                          side='top'
                        >
                          <HelpCircle className='h-4 w-4 text-muted-foreground hover:text-foreground cursor-help' />
                        </TooltipWrapper>
                      </div>
                      <Input
                        id='username'
                        placeholder='database_user'
                        value={formData.username}
                        onChange={handleChange}
                        className='focus:ring-2 focus:ring-ring focus:ring-offset-2'
                      />
                    </div>

                    <div>
                      <div className='flex items-center gap-2 mb-2'>
                        <Label htmlFor='password' className='font-medium'>
                          Password *
                        </Label>
                        <TooltipWrapper
                          content={
                            <div className='space-y-2'>
                              <p className='font-medium'>Password Requirements</p>
                              <ul className='list-disc pl-4 space-y-1'>
                                <li>Minimum 8 characters</li>
                                <li>Include uppercase and lowercase letters</li>
                                <li>Include at least one number</li>
                                <li>Include at least one special character</li>
                              </ul>
                            </div>
                          }
                          side='top'
                        >
                          <HelpCircle className='h-4 w-4 text-muted-foreground hover:text-foreground cursor-help' />
                        </TooltipWrapper>
                      </div>
                      <Input
                        id='password'
                        type='password'
                        placeholder='Enter secure password'
                        value={formData.password}
                        onChange={handleChange}
                        className='focus:ring-2 focus:ring-ring focus:ring-offset-2'
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className='border-t my-8'></div>

                {/* Network Details */}
                <div className='mb-8'>
                  <div className='mb-4'>
                    <h3 className='text-base font-semibold mb-2'>Network Details</h3>
                    <p className='text-sm text-muted-foreground'>
                      Configure VPC and subnet for your database network connectivity.
                      These settings determine how your database connects within your
                      infrastructure.
                    </p>
                  </div>

                  <div className='space-y-5'>
                    <div>
                      <Label htmlFor='vpc' className='mb-2 block font-medium'>
                        VPC *
                      </Label>
                      <Select
                        value={formData.vpc}
                        onValueChange={value => {
                          handleSelectChange('vpc', value);
                          handleSelectChange('subnet', ''); // Reset subnet when VPC changes
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select VPC' />
                        </SelectTrigger>
                        <SelectContent>
                          {vpcs
                            .filter(vpc => vpc.status === 'active')
                            .map(vpc => (
                              <SelectItem key={vpc.id} value={vpc.id}>
                                {vpc.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor='subnet' className='mb-2 block font-medium'>
                        Subnet *
                      </Label>
                      <Select
                        value={formData.subnet}
                        onValueChange={value => handleSelectChange('subnet', value)}
                        disabled={!formData.vpc}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select Subnet' />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedVpcSubnets.map((subnet: any) => (
                            <SelectItem key={subnet.id} value={subnet.id}>
                              {subnet.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className='border-t my-8'></div>

                {/* Backups - Accordion */}
                <div className='mb-8'>
                  <Accordion type='single' collapsible className='w-full'>
                    <AccordionItem value='backups'>
                      <AccordionTrigger className='text-base font-semibold'>
                        Backups
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className='pt-4 space-y-6'>
                          <p className='text-sm text-muted-foreground mb-4'>
                            Configure automated backups to protect your data. Regular
                            backups ensure you can restore your database in case of data
                            loss.
                          </p>

                          {/* Backup Name */}
                          <div>
                            <Label
                              htmlFor='backupName'
                              className='mb-2 block font-medium'
                            >
                              Backup Name
                            </Label>
                            <Input
                              id='backupName'
                              placeholder='daily-backup'
                              value={formData.backupName}
                              onChange={handleChange}
                            />
                          </div>

                          {/* Storage Bucket */}
                          <div>
                            <Label
                              htmlFor='storageBucket'
                              className='mb-2 block font-medium'
                            >
                              Storage Bucket
                            </Label>
                            <Select
                              value={formData.storageBucket}
                              onValueChange={value =>
                                handleSelectChange('storageBucket', value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Select storage bucket' />
                              </SelectTrigger>
                              <SelectContent>
                                {storageBuckets.map(bucket => (
                                  <SelectItem key={bucket.value} value={bucket.value}>
                                    {bucket.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Maximum Backups */}
                          <div>
                            <Label className='mb-3 block font-medium'>
                              Maximum Backups
                            </Label>
                            <p className='text-sm text-muted-foreground mb-3'>
                              Maximum number of backups to retain. Older backups will be
                              automatically deleted when this limit is reached.
                            </p>
                            <div className='flex items-center gap-2 mb-2'>
                              <span className='text-sm'>Quick Select</span>
                              {[3, 7, 14, 30].map(num => (
                                <Button
                                  key={num}
                                  type='button'
                                  variant={
                                    formData.maxBackups === num
                                      ? 'default'
                                      : 'outline'
                                  }
                                  size='sm'
                                  onClick={() =>
                                    handleSelectChange('maxBackups', num.toString())
                                  }
                                  className='rounded-full w-12 h-12'
                                >
                                  {num}
                                </Button>
                              ))}
                              <Input
                                type='number'
                                placeholder='Custom'
                                value={formData.customMaxBackups}
                                onChange={e =>
                                  handleSelectChange(
                                    'customMaxBackups',
                                    e.target.value
                                  )
                                }
                                className='w-20 h-9'
                              />
                              <span className='text-sm text-muted-foreground'>
                                backups
                              </span>
                            </div>
                            {formData.customMaxBackups && (
                              <p className='text-xs text-muted-foreground mt-2'>
                                Note: Currently retaining {formData.customMaxBackups}{' '}
                                backups. Set to unlimited by entering a very high number
                                (e.g., 365).
                              </p>
                            )}
                          </div>

                          {/* Backup Schedule */}
                          <div>
                            <Label className='mb-3 block font-medium'>
                              Backup Schedule
                            </Label>
                            <div className='grid grid-cols-2 gap-4 mb-4'>
                              <div>
                                <Label
                                  htmlFor='backupMinute'
                                  className='text-sm mb-1 block'
                                >
                                  Minute (0-59)
                                </Label>
                                <Input
                                  id='backupMinute'
                                  type='number'
                                  placeholder='30'
                                  value={formData.backupMinute}
                                  onChange={handleChange}
                                  min={0}
                                  max={59}
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor='backupHour'
                                  className='text-sm mb-1 block'
                                >
                                  Hour (0-23)
                                </Label>
                                <Select
                                  value={formData.backupHour}
                                  onValueChange={value =>
                                    handleSelectChange('backupHour', value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder='Any hour' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='*'>Any hour</SelectItem>
                                    {Array.from({ length: 24 }, (_, i) => (
                                      <SelectItem key={i} value={i.toString()}>
                                        {i.toString().padStart(2, '0')}:00
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label
                                  htmlFor='backupDay'
                                  className='text-sm mb-1 block'
                                >
                                  Day (1-31)
                                </Label>
                                <Select
                                  value={formData.backupDay}
                                  onValueChange={value =>
                                    handleSelectChange('backupDay', value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder='Any day' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='*'>Any day</SelectItem>
                                    {Array.from({ length: 31 }, (_, i) => (
                                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                                        {i + 1}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label
                                  htmlFor='backupMonth'
                                  className='text-sm mb-1 block'
                                >
                                  Month
                                </Label>
                                <Select
                                  value={formData.backupMonth}
                                  onValueChange={value =>
                                    handleSelectChange('backupMonth', value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder='Any month' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='*'>Any month</SelectItem>
                                    {[
                                      'January',
                                      'February',
                                      'March',
                                      'April',
                                      'May',
                                      'June',
                                      'July',
                                      'August',
                                      'September',
                                      'October',
                                      'November',
                                      'December',
                                    ].map((month, i) => (
                                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                                        {month}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className='col-span-2'>
                                <Label
                                  htmlFor='backupWeekday'
                                  className='text-sm mb-1 block'
                                >
                                  Weekday
                                </Label>
                                <Select
                                  value={formData.backupWeekday}
                                  onValueChange={value =>
                                    handleSelectChange('backupWeekday', value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder='Any weekday' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='*'>Any weekday</SelectItem>
                                    {[
                                      'Sunday',
                                      'Monday',
                                      'Tuesday',
                                      'Wednesday',
                                      'Thursday',
                                      'Friday',
                                      'Saturday',
                                    ].map((day, i) => (
                                      <SelectItem key={i} value={i.toString()}>
                                        {day}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Common Examples */}
                            <div className='p-3 bg-muted/50 rounded-lg mb-4'>
                              <div className='font-medium text-sm mb-2'>
                                Common Examples:
                              </div>
                              <ul className='text-xs text-muted-foreground space-y-1'>
                                <li>
                                  • Every 30 minutes: Minute: 30, leave others empty
                                </li>
                                <li>
                                  • Daily at 2:30 AM: Minute: 30, Hour: 2, leave others
                                  empty
                                </li>
                                <li>
                                  • Weekly backup on Sunday at 3:00 AM: Minute: 0, Hour:
                                  3, Weekday: Sunday
                                </li>
                                <li>
                                  • Monthly on 1st at midnight: Minute: 0, Hour: 0, Day: 1
                                </li>
                              </ul>
                            </div>

                            {/* CRON Expression */}
                            <div>
                              <Label className='mb-2 block font-medium'>
                                CRON Expression:
                              </Label>
                              <div className='flex gap-2'>
                                <Input
                                  value={generateCronExpression()}
                                  readOnly
                                  className='font-mono'
                                />
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='icon'
                                  onClick={handleCopyCron}
                                >
                                  {cronCopied ? (
                                    <Check className='h-4 w-4' />
                                  ) : (
                                    <Copy className='h-4 w-4' />
                                  )}
                                </Button>
                              </div>
                              <p className='text-xs text-muted-foreground mt-1'>
                                This policy will run at{' '}
                                {formData.backupMinute || 'every'} minute
                                {formData.backupHour
                                  ? `, ${formData.backupHour}:00 hour`
                                  : ''}
                                .
                              </p>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </form>
            </CardContent>
            <div className='flex justify-end gap-4 px-6 pb-6'>
              <Button
                type='button'
                variant='outline'
                className='hover:bg-secondary transition-colors'
                onClick={() => router.push('/database')}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={!isFormValid()}
                className={`transition-colors ${
                  isFormValid()
                    ? 'bg-black text-white hover:bg-black/90 hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={handleSubmit}
              >
                {!isFormValid()
                  ? formTouched
                    ? 'Fill Required Fields'
                    : 'View Summary'
                  : 'View Summary'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <div className='w-full md:w-80 space-y-6'>
          {/* Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base font-normal'>
                Best Practices
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
                    Choose the database engine that best matches your application
                    requirements
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span
                    className='text-muted-foreground'
                    style={{ fontSize: '13px' }}
                  >
                    Select configuration tier based on expected workload and traffic
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span
                    className='text-muted-foreground'
                    style={{ fontSize: '13px' }}
                  >
                    Enable high availability for production databases
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span
                    className='text-muted-foreground'
                    style={{ fontSize: '13px' }}
                  >
                    Use strong passwords and secure your database credentials
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span
                    className='text-muted-foreground'
                    style={{ fontSize: '13px' }}
                  >
                    Configure regular automated backups to prevent data loss
                  </span>
                </li>
              </ul>
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
              <div className='flex items-center justify-between'>
                <h3 className='text-base font-semibold'>Estimated Cost</h3>
              </div>
            </div>
            <div className='space-y-3'>
              <div className='flex items-baseline gap-2'>
                <span className='text-2xl font-bold'>
                  ₹{calculateTotalCost()}
                </span>
                <span className='text-sm text-muted-foreground'>per month</span>
              </div>
              <p className='text-sm text-muted-foreground'>
                This is an estimated cost based on your selected configuration.
              </p>
              <div className='text-xs text-muted-foreground pt-2 border-t space-y-1'>
                {formData.configuration && (
                  <p>
                    • Configuration:{' '}
                    ₹
                    {configurationTiers
                      .find(tier => tier.id === formData.configuration)
                      ?.price.toFixed(2) || 0}
                    /month
                  </p>
                )}
                <p>• Storage: ₹{storagePrice}/month</p>
                {formData.replicaConfig === 'one-standby' && (
                  <p>• High Availability (1 standby): ₹231.35/month</p>
                )}
                {formData.replicaConfig === 'two-standby' && (
                  <p>• High Availability (2 standby): ₹462.70/month</p>
                )}
                <p className='pt-1'>• Data transfer charges may apply</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

