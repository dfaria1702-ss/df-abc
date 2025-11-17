'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { PageLayout } from '../../../components/page-layout';
import { DetailGrid } from '../../../components/detail-grid';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { getDatabase } from '../../../lib/data';
import { DeleteConfirmationModal } from '../../../components/delete-confirmation-modal';
import { StatusBadge } from '../../../components/status-badge';
import { Edit, Trash2, RotateCcw, Pause, Play, Copy, Eye, EyeOff, Plus, TrendingUp, TrendingDown, Activity, AlertCircle, HelpCircle } from 'lucide-react';
import { VercelTabs } from '../../../components/ui/vercel-tabs';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ShadcnDataTable } from '../../../components/ui/shadcn-data-table';
import { useToast } from '../../../hooks/use-toast';
import { TooltipWrapper } from '../../../components/ui/tooltip-wrapper';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

const tabs = [
  { id: 'connection', label: 'Connection Details' },
  { id: 'backups', label: 'Backups' },
  { id: 'monitoring', label: 'Monitoring' },
];

// Mock data for backup schedules
const backupSchedules = [
  {
    id: 'backup-1',
    name: 'hourly-backup',
    schedule: 'Every hour at minute 0',
    storageBucket: 'backup-storage-us-east',
    maxBackups: 7,
  },
  {
    id: 'backup-2',
    name: 'daily-backup',
    schedule: 'Daily at 12:00 AM',
    storageBucket: 'backup-storage-us-west',
    maxBackups: 30,
  },
];

// Mock data for backup history
const backupHistory = [
  {
    id: 'bkp-1',
    status: 'active',
    name: 'backup-zjr',
    started: '27/06/2024 at 09:29 PM',
    finished: '27/06/2024 at 09:29 PM',
  },
  {
    id: 'bkp-2',
    status: 'active',
    name: 'backup-a4y',
    started: '27/06/2024 at 09:28 PM',
    finished: '27/06/2024 at 09:28 PM',
  },
  {
    id: 'bkp-3',
    status: 'active',
    name: 'backup-5ms',
    started: '27/06/2024 at 09:24 PM',
    finished: '27/06/2024 at 09:25 PM',
  },
  {
    id: 'bkp-4',
    status: 'active',
    name: 'backup-iaz',
    started: '27/06/2024 at 01:18 PM',
    finished: '27/06/2024 at 01:19 PM',
  },
];

// Enhanced monitoring data with historical context
const monitoringData = {
  cpuUtilization: {
    current: 64,
    trend: 'stable',
    threshold: { warning: 70, critical: 85 },
    history: Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      usage: Math.random() * 20 + 50,
      baseline: 45
    })),
    insight: 'CPU usage is within normal range. Peak hours: 9-11 AM, 2-4 PM'
  },
  freeableMemory: {
    available: 5.2,
    total: 8,
    used: 2.8,
    trend: 'improving',
    history: Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      available: Math.random() * 1.5 + 4.5,
      used: 8 - (Math.random() * 1.5 + 4.5)
    })),
    insight: 'Memory management is optimal with 65% availability'
  },
  dbConnections: {
    active: 48,
    max: 200,
    trend: 'increasing',
    breakdown: [
      { type: 'Read', count: 28, percentage: 58 },
      { type: 'Write', count: 12, percentage: 25 },
      { type: 'Admin', count: 8, percentage: 17 }
    ],
    history: Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      active: Math.floor(Math.random() * 20 + 35),
      peak: Math.floor(Math.random() * 30 + 50)
    })),
    insight: 'Connections balanced across operations. Consider read replicas for scaling'
  },
  freeStorage: {
    used: 23,
    free: 77,
    total: 100,
    trend: 'stable',
    projection: Array.from({ length: 12 }, (_, i) => ({
      month: `M${i + 1}`,
      projected: 23 + (i * 2.5),
      threshold: 80
    })),
    insight: 'Storage will reach 80% capacity in ~9 months at current growth rate'
  },
  diskIO: {
    read: 2.4,
    write: 1.7,
    readTrend: 'stable',
    writeTrend: 'increasing',
    history: Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      read: Math.random() * 2 + 1.5,
      write: Math.random() * 1.5 + 0.8,
      total: (Math.random() * 2 + 1.5) + (Math.random() * 1.5 + 0.8)
    })),
    insight: 'I/O performance is healthy. Write operations show slight upward trend'
  },
  diskQueue: {
    current: 2.1,
    optimal: 1.0,
    threshold: 5.0,
    trend: 'concerning',
    history: Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      depth: Math.random() * 2 + 1,
      latency: Math.random() * 30 + 15
    })),
    insight: 'Queue depth above optimal. Consider I/O optimization or scaling'
  }
};

export default function DatabaseDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('connection');
  const [showPassword, setShowPassword] = useState(false);
  const [showConnectionURL, setShowConnectionURL] = useState(false);
  
  // Create Backup Modal State
  const [isCreateBackupModalOpen, setIsCreateBackupModalOpen] = useState(false);
  const [backupFormData, setBackupFormData] = useState({
    backupName: '',
    storageBucket: '',
    maxBackups: 7,
    minute: '30',
    hour: '*',
    day: '*',
    month: '*',
    weekday: '*',
  });
  const database = getDatabase(params.id);

  if (!database) {
    notFound();
  }

  const handleDelete = () => {
    // In a real app, this would delete the database
    console.log('Deleting database:', database.name);
    router.push('/database');
  };

  const handleEdit = () => {
    router.push(`/database/${database.id}/edit`);
  };

  const handleRestart = () => {
    console.log('Restarting database:', database.name);
    // Mock restart action
  };

  const handlePauseResume = () => {
    console.log(database.status === 'stopped' ? 'Resuming' : 'Pausing', 'database:', database.name);
    // Mock pause/resume action
  };

  // Format created date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${label} has been copied to your clipboard.`,
    });
  };

  // Generate CRON expression from form data
  const generateCronExpression = () => {
    return `${backupFormData.minute} ${backupFormData.hour} ${backupFormData.day} ${backupFormData.month} ${backupFormData.weekday}`;
  };

  // Handle max backups quick select
  const handleMaxBackupsQuickSelect = (value: number) => {
    setBackupFormData({ ...backupFormData, maxBackups: value });
  };

  // Handle backup form submission
  const handleCreateBackup = () => {
    console.log('Creating backup with data:', backupFormData);
    toast({
      title: 'Backup Schedule Created',
      description: `Backup schedule "${backupFormData.backupName}" has been created successfully.`,
    });
    setIsCreateBackupModalOpen(false);
    // Reset form
    setBackupFormData({
      backupName: '',
      storageBucket: '',
      maxBackups: 7,
      minute: '30',
      hour: '*',
      day: '*',
      month: '*',
      weekday: '*',
    });
  };

  // Mock connection details
  const connectionDetails = {
    hosts: [
      'aac24173c14264d30ba8c67518153697-956d2b1fde21c4b7.elb.us-east-1.amazonaws.com:27017',
      'ab1e00129beac49dda3c84e0471157 6f-500a2d077cd5c3f2.elb.us-east-1.amazonaws.com:27017',
      'abe9ad997a7f94d76b3b590c69547f10-aa3785d03f7c83aa.elb.us-east-1.amazonaws.com:27017',
    ],
    port: '27017',
    username: 'databaseAdmin',
    password: 'SecureP@ssw0rd!2024',
    connectionURL: 'mongodb://databaseAdmin:SecureP@ssw0rd!2024@aac24173c14264d30ba8c67518153697-956d2b1fde21c4b7.elb.us-east-1.amazonaws.com:27017',
  };

  // Trend Indicator Component
  const TrendIndicator = ({ trend }: { trend: string }) => {
    const config = {
      improving: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
      stable: { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
      increasing: { icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
      concerning: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
    };
    
    const Icon = config[trend as keyof typeof config]?.icon || Activity;
    const colors = config[trend as keyof typeof config] || config.stable;
    
    return (
      <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full ${colors.bg} border ${colors.border}`}>
        <Icon className={`w-3.5 h-3.5 ${colors.color}`} />
        <span className={`text-xs font-medium ${colors.color} capitalize`}>{trend}</span>
      </div>
    );
  };

  // Enhanced Highcharts configurations
  const getAreaChart = (data: any[], dataKey: string, baselineKey?: string) => ({
    chart: {
      type: 'areaspline',
      height: 180,
      backgroundColor: 'transparent',
      spacing: [10, 10, 10, 10],
    },
    title: { text: null },
    xAxis: {
      categories: data.map(d => d.time),
      labels: {
        enabled: true,
        style: { fontSize: '10px', color: '#9ca3af' },
        step: 4
      },
      lineWidth: 0,
      tickWidth: 0,
    },
    yAxis: {
      title: { text: null },
      labels: {
        enabled: true,
        style: { fontSize: '10px', color: '#9ca3af' }
      },
      gridLineColor: '#f3f4f6',
      gridLineWidth: 1,
    },
    tooltip: {
      shared: true,
      backgroundColor: '#1f2937',
      borderColor: '#1f2937',
      borderRadius: 6,
      style: { color: '#ffffff', fontSize: '11px' }
    },
    legend: { enabled: false },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.3,
        marker: { enabled: false, states: { hover: { enabled: true, radius: 4 } } },
      },
      spline: {
        marker: { enabled: false },
      }
    },
    series: [
      {
        name: 'Current',
        data: data.map(d => d[dataKey]),
        color: '#3b82f6',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, 'rgba(59, 130, 246, 0.3)'], [1, 'rgba(59, 130, 246, 0.05)']]
        },
      },
      ...(baselineKey ? [{
        type: 'spline',
        name: 'Baseline',
        data: data.map(d => d[baselineKey]),
        color: '#10b981',
        dashStyle: 'Dash',
        lineWidth: 2,
      }] : [])
    ],
    credits: { enabled: false },
  });

  const getDualLineChart = (data: any[]) => ({
    chart: {
      type: 'spline',
      height: 180,
      backgroundColor: 'transparent',
      spacing: [10, 10, 10, 10],
    },
    title: { text: null },
    xAxis: {
      categories: data.map(d => d.time),
      labels: {
        enabled: true,
        style: { fontSize: '10px', color: '#9ca3af' },
        step: 4
      },
      lineWidth: 0,
      tickWidth: 0,
    },
    yAxis: {
      title: { text: null },
      labels: {
        enabled: true,
        style: { fontSize: '10px', color: '#9ca3af' }
      },
      gridLineColor: '#f3f4f6',
    },
    tooltip: {
      shared: true,
      backgroundColor: '#1f2937',
      borderColor: '#1f2937',
      style: { color: '#ffffff', fontSize: '11px' }
    },
    legend: { enabled: false },
    plotOptions: {
      spline: {
        marker: { enabled: false, states: { hover: { enabled: true, radius: 4 } } },
      }
    },
    series: [
      {
        name: 'Available',
        data: data.map(d => d.available),
        color: '#10b981',
        lineWidth: 2,
      },
      {
        name: 'Used',
        data: data.map(d => d.used),
        color: '#ef4444',
        lineWidth: 2,
      }
    ],
    credits: { enabled: false },
  });

  const getStackedAreaChart = (data: any[]) => ({
    chart: {
      type: 'areaspline',
      height: 180,
      backgroundColor: 'transparent',
      spacing: [10, 10, 10, 10],
    },
    title: { text: null },
    xAxis: {
      categories: data.map(d => d.time),
      labels: {
        enabled: true,
        style: { fontSize: '10px', color: '#9ca3af' },
        step: 4
      },
      lineWidth: 0,
      tickWidth: 0,
    },
    yAxis: {
      title: { text: null },
      labels: {
        enabled: true,
        style: { fontSize: '10px', color: '#9ca3af' }
      },
      gridLineColor: '#f3f4f6',
    },
    tooltip: {
      shared: true,
      backgroundColor: '#1f2937',
      borderColor: '#1f2937',
      style: { color: '#ffffff', fontSize: '11px' }
    },
    legend: { enabled: false },
    plotOptions: {
      areaspline: {
        stacking: 'normal',
        fillOpacity: 0.7,
        marker: { enabled: false },
      }
    },
    series: [
      {
        name: 'Write',
        data: data.map(d => d.write),
        color: '#93c5fd',
      },
      {
        name: 'Read',
        data: data.map(d => d.read),
        color: '#3b82f6',
      }
    ],
    credits: { enabled: false },
  });

  const customBreadcrumbs = [
    { href: '/dashboard', title: 'Home' },
    { href: '/database', title: 'Database' },
    { href: `/database/${database.id}`, title: database.name },
  ];

  return (
    <PageLayout
      title={database.name}
      customBreadcrumbs={customBreadcrumbs}
      hideViewDocs={true}
    >
      {/* Database Basic Information - Summary Card */}
      <div
        className='mb-6 group relative'
        style={{
          borderRadius: '16px',
          border: '4px solid #FFF',
          background: 'linear-gradient(265deg, #FFF -13.17%, #F7F8FD 133.78%)',
          boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)',
          padding: '1.5rem',
        }}
      >
        {/* Overlay Action Buttons */}
        {database.status !== 'deleting' && (
          <div className='absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10'>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleEdit}
              className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
              title='Edit'
            >
              <Edit className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleRestart}
              className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
              title='Restart'
            >
              <RotateCcw className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={handlePauseResume}
              className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
              title={database.status === 'stopped' ? 'Resume' : 'Pause'}
            >
              {database.status === 'stopped' ? (
                <Play className='h-4 w-4' />
              ) : (
                <Pause className='h-4 w-4' />
              )}
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsDeleteModalOpen(true)}
              className='h-8 w-8 p-0 text-muted-foreground hover:text-red-600 bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
              title='Delete'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        )}

        <DetailGrid>
          {/* Row 1: Status, DB Engine, DB Version (3 columns) */}
          <div className='col-span-full grid grid-cols-3 gap-4'>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Status
              </label>
              <div>
                <StatusBadge status={database.status} />
              </div>
            </div>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                DB Engine
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {database.dbEngine}
              </div>
            </div>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                DB Version
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {database.engineVersion}
              </div>
            </div>
          </div>

          {/* Row 2: VPC, Subnet, Configuration (3 columns) */}
          <div className='col-span-full grid grid-cols-3 gap-4'>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                VPC
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {database.vpc || 'N/A'}
              </div>
            </div>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Subnet
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {database.subnet || 'N/A'}
              </div>
            </div>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Configuration
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {database.configuration || database.instanceType}
              </div>
            </div>
          </div>

          {/* Row 3: Storage, Created On (3 columns - Storage and Created On, third empty) */}
          <div className='col-span-full grid grid-cols-3 gap-4'>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Storage
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {database.storage}
              </div>
            </div>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Created On
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {formatDate(database.createdOn)}
              </div>
            </div>
            <div className='space-y-1'>
              {/* Empty third column for balanced layout */}
            </div>
          </div>
        </DetailGrid>
      </div>

      {/* Tabs Section */}
      <div className='space-y-6'>
        <VercelTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          size='lg'
        />

        {/* Connection Details Tab */}
        {activeTab === 'connection' && (
          <div className='bg-card text-card-foreground border-border border rounded-lg p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Left Column */}
              <div className='space-y-6'>
                {/* Port */}
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-2'>Port</label>
                  <div className='text-base'>{connectionDetails.port}</div>
                </div>

                {/* Host Section */}
                <div>
                  <div className='flex items-center gap-2 mb-3'>
                    <label className='text-sm font-medium text-gray-700'>Host</label>
                    <TooltipWrapper
                      content={
                        <div className='space-y-2'>
                          <p>
                            The endpoint (hostname or IP address) of your database instance or cluster. It identifies where your database is hosted and is used by clients to connect.
                          </p>
                          <p>
                            In a multi-node setup (like MongoDB replica sets), multiple host entries may appear—one for each node (primary and replicas).
                          </p>
                        </div>
                      }
                      side='top'
                    >
                      <HelpCircle className='h-4 w-4 text-muted-foreground hover:text-foreground cursor-help' />
                    </TooltipWrapper>
                  </div>
                  <div className='space-y-2'>
                    {connectionDetails.hosts.map((host, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between bg-muted p-3 rounded-md border'
                      >
                        <code className='text-sm font-mono'>{host}</code>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                          onClick={() => copyToClipboard(host, 'Host')}
                        >
                          <Copy className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className='space-y-6'>
                {/* Username */}
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-2'>Username</label>
                  <div className='text-base'>{connectionDetails.username}</div>
                </div>

                {/* Password */}
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-2'>Password</label>
                  <div className='flex items-center justify-between bg-muted p-3 rounded-md border'>
                    <code className='text-sm font-mono'>
                      {showPassword ? connectionDetails.password : '*'.repeat(17)}
                    </code>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0'
                        onClick={() => copyToClipboard(connectionDetails.password, 'Password')}
                      >
                        <Copy className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Connection URL */}
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-2'>Connection URL</label>
                  <div className='flex items-center justify-between bg-muted p-3 rounded-md border'>
                    <code className='text-sm font-mono'>
                      {showConnectionURL ? connectionDetails.connectionURL : '•'.repeat(45)}
                    </code>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0'
                        onClick={() => setShowConnectionURL(!showConnectionURL)}
                      >
                        {showConnectionURL ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0'
                        onClick={() => copyToClipboard(connectionDetails.connectionURL, 'Connection URL')}
                      >
                        <Copy className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backups Tab */}
        {activeTab === 'backups' && (
          <div>
            {/* Backups Header */}
            <div className='flex items-center justify-between mb-6'>
              <div>
                <p className='text-sm text-muted-foreground'>{backupSchedules.length} active schedules</p>
              </div>
              <Button onClick={() => setIsCreateBackupModalOpen(true)}>
                Create backup
              </Button>
            </div>

            {/* Backup Schedules */}
            <div className='space-y-4 mb-8'>
              {backupSchedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardContent className='pt-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <div>
                        <h3 className='font-semibold text-base mb-1'>{schedule.name}</h3>
                        <p className='text-sm text-muted-foreground'>{schedule.schedule}</p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-sm text-muted-foreground mb-1'>Storage Bucket</p>
                        <p className='text-sm font-medium'>{schedule.storageBucket}</p>
                      </div>
                      <div>
                        <p className='text-sm text-muted-foreground mb-1'>Maximum Backups</p>
                        <p className='text-sm font-medium'>{schedule.maxBackups}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Backup History */}
            <div className='bg-card text-card-foreground border-border border rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4'>Backup History</h3>
              <ShadcnDataTable
                columns={[
                  {
                    key: 'status',
                    label: 'Status',
                    sortable: true,
                    render: (value: string) => (
                      <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 rounded-full bg-green-500'></div>
                        <span className='text-sm'>Succeeded</span>
                      </div>
                    ),
                  },
                  {
                    key: 'name',
                    label: 'Name',
                    sortable: true,
                    searchable: true,
                    render: (value: string) => <span className='text-sm'>{value}</span>,
                  },
                  {
                    key: 'started',
                    label: 'Started',
                    sortable: true,
                    render: (value: string) => <span className='text-sm'>{value}</span>,
                  },
                  {
                    key: 'finished',
                    label: 'Finished',
                    sortable: true,
                    render: (value: string) => <span className='text-sm'>{value}</span>,
                  },
                ]}
                data={backupHistory}
                searchableColumns={['name']}
                pageSize={10}
                enableSearch={false}
                enableColumnVisibility={false}
                enablePagination={true}
                enableVpcFilter={false}
              />
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className='space-y-6'>
            {/* Top Row - CPU and Memory */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* CPU Utilization */}
              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-base font-semibold'>CPU Utilization</h3>
                    <TrendIndicator trend={monitoringData.cpuUtilization.trend} />
                  </div>
                  
                  <div className='mb-4'>
                    <div className='flex items-baseline space-x-2'>
                      <span className='text-3xl font-bold'>{monitoringData.cpuUtilization.current}%</span>
                      <span className='text-sm text-muted-foreground'>Current Usage</span>
                    </div>
                    <div className='mt-3'>
                      <div className='flex justify-between text-xs text-muted-foreground mb-1'>
                        <span>Current</span>
                        <span>Warning: {monitoringData.cpuUtilization.threshold.warning}% / Critical: {monitoringData.cpuUtilization.threshold.critical}%</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2 border border-gray-300'>
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            monitoringData.cpuUtilization.current > monitoringData.cpuUtilization.threshold.critical ? 'bg-red-500' : 
                            monitoringData.cpuUtilization.current > monitoringData.cpuUtilization.threshold.warning ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${monitoringData.cpuUtilization.current}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className='h-[180px]'>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={getAreaChart(monitoringData.cpuUtilization.history, 'usage', 'baseline')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Freeable Memory */}
              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-base font-semibold'>Memory Usage</h3>
                    <TrendIndicator trend={monitoringData.freeableMemory.trend} />
                  </div>
                  
                  <div className='mb-4'>
                    <div className='flex items-baseline space-x-2'>
                      <span className='text-3xl font-bold'>{monitoringData.freeableMemory.available} GB</span>
                      <span className='text-sm text-muted-foreground'>Available</span>
                    </div>
                    <div className='mt-3'>
                      <div className='flex justify-between text-xs text-muted-foreground mb-2'>
                        <span>Used: {monitoringData.freeableMemory.used.toFixed(1)} GB</span>
                        <span>Total: {monitoringData.freeableMemory.total} GB</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-3 border border-gray-300'>
                        <div 
                          className='h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all'
                          style={{ width: `${(monitoringData.freeableMemory.available / monitoringData.freeableMemory.total) * 100}%` }}
                        />
                      </div>
                      <div className='text-center mt-1 text-xs font-medium text-gray-700'>
                        {((monitoringData.freeableMemory.available / monitoringData.freeableMemory.total) * 100).toFixed(1)}% Available
                      </div>
                    </div>
                  </div>

                  <div className='h-[150px]'>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={getDualLineChart(monitoringData.freeableMemory.history)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Row - Connections and Storage */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Database Connections */}
              <Card className='h-full overflow-hidden border border-border/80 shadow-sm'>
                <CardContent className='pt-6 space-y-5'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-base font-semibold'>Database Connections</h3>
                    <TrendIndicator trend={monitoringData.dbConnections.trend} />
                  </div>
                  
                  <div className='flex items-baseline space-x-2 text-foreground'>
                    <span className='text-4xl font-semibold tracking-tight'>{monitoringData.dbConnections.active}</span>
                    <span className='text-sm text-muted-foreground'>/ {monitoringData.dbConnections.max} max</span>
                  </div>

                  <div className='rounded-2xl border border-border/70 bg-muted/40 divide-y divide-border/60 overflow-hidden'>
                    {monitoringData.dbConnections.breakdown.map((item, index) => {
                      const colors = ['#10b981', '#ef4444', '#f59e0b']
                      return (
                        <div
                          key={index}
                          className='flex items-center justify-between px-4 py-3'
                        >
                          <div className='flex items-center space-x-3'>
                            <span
                              className='inline-flex h-2.5 w-2.5 rounded-full'
                              style={{ backgroundColor: colors[index] }}
                            />
                            <span className='text-sm font-medium text-foreground'>
                              {item.type}
                            </span>
                          </div>
                          <div className='text-sm font-semibold text-foreground'>
                            {item.count}{' '}
                            <span className='text-muted-foreground font-normal'>
                              ({item.percentage}%)
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className='h-[150px] w-full'>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={getAreaChart(monitoringData.dbConnections.history, 'active')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Free Storage Space */}
              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-base font-semibold'>Storage Space</h3>
                    <TrendIndicator trend={monitoringData.freeStorage.trend} />
                  </div>
                  
                  <div className='mb-4'>
                    <div className='flex items-baseline space-x-2'>
                      <span className='text-3xl font-bold'>{monitoringData.freeStorage.free} GB</span>
                      <span className='text-sm text-muted-foreground'>Free</span>
                    </div>
                    <div className='mt-3'>
                      <div className='flex justify-between text-xs text-muted-foreground mb-2'>
                        <span>Used: {monitoringData.freeStorage.used} GB</span>
                        <span>Total: {monitoringData.freeStorage.total} GB</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-4 border border-gray-300 relative'>
                        <div 
                          className='h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all'
                          style={{ width: `${monitoringData.freeStorage.used}%` }}
                        />
                        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold'>
                          {monitoringData.freeStorage.used}% Used
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='mb-3'>
                    <h4 className='text-xs font-semibold text-gray-700 mb-2'>12-Month Projection</h4>
                    <div className='h-[120px]'>
                      <HighchartsReact
                        highcharts={Highcharts}
                        options={{
                          chart: { type: 'spline', height: 120, backgroundColor: 'transparent', spacing: [5, 5, 5, 5] },
                          title: { text: null },
                          xAxis: {
                            categories: monitoringData.freeStorage.projection.map(d => d.month),
                            labels: { style: { fontSize: '9px', color: '#9ca3af' } },
                            lineWidth: 0,
                            tickWidth: 0,
                          },
                          yAxis: {
                            title: { text: null },
                            labels: { style: { fontSize: '9px', color: '#9ca3af' } },
                            gridLineColor: '#f3f4f6',
                          },
                          tooltip: {
                            backgroundColor: '#1f2937',
                            borderColor: '#1f2937',
                            style: { color: '#ffffff', fontSize: '10px' }
                          },
                          legend: { enabled: false },
                          plotOptions: { spline: { marker: { enabled: false } } },
                          series: [
                            {
                              name: 'Projected',
                              data: monitoringData.freeStorage.projection.map(d => d.projected),
                              color: '#f59e0b',
                              lineWidth: 2,
                            },
                            {
                              name: 'Threshold',
                              data: monitoringData.freeStorage.projection.map(d => d.threshold),
                              color: '#ef4444',
                              dashStyle: 'Dash',
                              lineWidth: 2,
                            }
                          ],
                          credits: { enabled: false },
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row - Disk Performance */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Disk I/O Performance */}
              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-base font-semibold'>Disk I/O Performance</h3>
                    <TrendIndicator trend={monitoringData.diskIO.writeTrend} />
                  </div>
                  
                  <div className='mb-4'>
                    <div className='flex items-baseline space-x-2'>
                      <span className='text-2xl font-bold'>{monitoringData.diskIO.read} / {monitoringData.diskIO.write}</span>
                      <span className='text-sm text-muted-foreground'>MB/s (R/W)</span>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-3 mb-4'>
                    <div className='p-3 bg-green-50 rounded-lg border border-green-200'>
                      <h4 className='text-xs font-semibold text-green-800'>Read</h4>
                      <p className='text-xl font-bold text-green-900'>{monitoringData.diskIO.read} MB/s</p>
                      <p className='text-xs text-green-600'>Trend: {monitoringData.diskIO.readTrend}</p>
                    </div>
                    <div className='p-3 bg-purple-50 rounded-lg border border-purple-200'>
                      <h4 className='text-xs font-semibold text-purple-800'>Write</h4>
                      <p className='text-xl font-bold text-purple-900'>{monitoringData.diskIO.write} MB/s</p>
                      <p className='text-xs text-purple-600'>Trend: {monitoringData.diskIO.writeTrend}</p>
                    </div>
                  </div>

                  <div className='h-[160px]'>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={getStackedAreaChart(monitoringData.diskIO.history)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Disk Queue Depth */}
              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-base font-semibold'>Disk Queue Depth</h3>
                    <TrendIndicator trend={monitoringData.diskQueue.trend} />
                  </div>
                  
                  <div className='mb-4'>
                    <div className='flex items-baseline space-x-2'>
                      <span className='text-3xl font-bold'>{monitoringData.diskQueue.current}</span>
                      <span className='text-sm text-muted-foreground'>avg depth</span>
                    </div>
                    <div className='mt-3'>
                      <div className='flex justify-between text-xs text-muted-foreground mb-1'>
                        <span>Current: {monitoringData.diskQueue.current}</span>
                        <span>Optimal: &lt; {monitoringData.diskQueue.optimal}</span>
                        <span>Critical: &gt; {monitoringData.diskQueue.threshold}</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-3 border border-gray-300'>
                        <div 
                          className={`h-3 rounded-full transition-all ${
                            monitoringData.diskQueue.current > monitoringData.diskQueue.threshold ? 'bg-red-500' :
                            monitoringData.diskQueue.current > monitoringData.diskQueue.optimal * 2 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((monitoringData.diskQueue.current / monitoringData.diskQueue.threshold) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className='h-[160px]'>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={getAreaChart(monitoringData.diskQueue.history, 'depth')}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        resourceName={database.name}
        resourceType='Database'
        onConfirm={handleDelete}
      />

      {/* Create Backup Modal */}
      <Dialog open={isCreateBackupModalOpen} onOpenChange={setIsCreateBackupModalOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] flex flex-col'>
          <DialogHeader>
            <DialogTitle>Create Backup Schedule</DialogTitle>
            <DialogDescription>
              Configure a backup schedule for your database instance.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6 py-4 overflow-y-auto flex-1'>
            {/* Backup Name */}
            <div className='space-y-2'>
              <Label htmlFor='backupName'>Backup Name</Label>
              <Input
                id='backupName'
                placeholder='daily-backup'
                value={backupFormData.backupName}
                onChange={(e) => setBackupFormData({ ...backupFormData, backupName: e.target.value })}
              />
            </div>

            {/* Storage Bucket */}
            <div className='space-y-2'>
              <Label htmlFor='storageBucket'>Storage Bucket</Label>
              <Select
                value={backupFormData.storageBucket}
                onValueChange={(value) => setBackupFormData({ ...backupFormData, storageBucket: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select storage bucket' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='backup-storage-us-east'>backup-storage-us-east</SelectItem>
                  <SelectItem value='backup-storage-us-west'>backup-storage-us-west</SelectItem>
                  <SelectItem value='backup-storage-eu-central'>backup-storage-eu-central</SelectItem>
                  <SelectItem value='backup-storage-ap-south'>backup-storage-ap-south</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Maximum Backups */}
            <div className='space-y-3'>
              <Label>Maximum Backups</Label>
              <p className='text-sm text-muted-foreground'>
                Maximum number of backups to retain. Older backups will be automatically deleted when this limit is reached.
              </p>
              <div className='flex items-center gap-4 flex-wrap'>
                <span className='text-sm font-medium'>Quick Select</span>
                {[3, 7, 14, 30].map((value) => (
                  <Button
                    key={value}
                    type='button'
                    variant={backupFormData.maxBackups === value ? 'default' : 'outline'}
                    className={`h-12 w-12 rounded-full ${
                      backupFormData.maxBackups === value ? 'bg-black text-white hover:bg-black/90' : ''
                    }`}
                    onClick={() => handleMaxBackupsQuickSelect(value)}
                  >
                    {value}
                  </Button>
                ))}
                <span className='text-sm font-medium'>Custom</span>
                <Input
                  type='number'
                  className='w-24'
                  value={backupFormData.maxBackups}
                  onChange={(e) => setBackupFormData({ ...backupFormData, maxBackups: parseInt(e.target.value) || 0 })}
                />
                <span className='text-sm text-muted-foreground'>backups</span>
              </div>
              <div className='bg-muted p-3 rounded-md border'>
                <p className='text-sm'>
                  <strong>Note:</strong> Currently retaining {backupFormData.maxBackups} backups. Set to unlimited by entering a very high number (e.g., 365).
                </p>
              </div>
            </div>

            {/* Backup Schedule */}
            <div className='space-y-3'>
              <Label>Backup Schedule</Label>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='minute' className='text-sm'>Minute (0-59)</Label>
                  <Input
                    id='minute'
                    placeholder='30'
                    value={backupFormData.minute}
                    onChange={(e) => setBackupFormData({ ...backupFormData, minute: e.target.value })}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='hour' className='text-sm'>Hour (0-23)</Label>
                  <Select
                    value={backupFormData.hour}
                    onValueChange={(value) => setBackupFormData({ ...backupFormData, hour: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Any hour' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='*'>Any hour</SelectItem>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='day' className='text-sm'>Day (1-31)</Label>
                  <Select
                    value={backupFormData.day}
                    onValueChange={(value) => setBackupFormData({ ...backupFormData, day: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Any day' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='*'>Any day</SelectItem>
                      {Array.from({ length: 31 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='month' className='text-sm'>Month</Label>
                  <Select
                    value={backupFormData.month}
                    onValueChange={(value) => setBackupFormData({ ...backupFormData, month: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Any month' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='*'>Any month</SelectItem>
                      <SelectItem value='1'>January</SelectItem>
                      <SelectItem value='2'>February</SelectItem>
                      <SelectItem value='3'>March</SelectItem>
                      <SelectItem value='4'>April</SelectItem>
                      <SelectItem value='5'>May</SelectItem>
                      <SelectItem value='6'>June</SelectItem>
                      <SelectItem value='7'>July</SelectItem>
                      <SelectItem value='8'>August</SelectItem>
                      <SelectItem value='9'>September</SelectItem>
                      <SelectItem value='10'>October</SelectItem>
                      <SelectItem value='11'>November</SelectItem>
                      <SelectItem value='12'>December</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='weekday' className='text-sm'>Weekday</Label>
                <Select
                  value={backupFormData.weekday}
                  onValueChange={(value) => setBackupFormData({ ...backupFormData, weekday: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Any weekday' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='*'>Any weekday</SelectItem>
                    <SelectItem value='0'>Sunday</SelectItem>
                    <SelectItem value='1'>Monday</SelectItem>
                    <SelectItem value='2'>Tuesday</SelectItem>
                    <SelectItem value='3'>Wednesday</SelectItem>
                    <SelectItem value='4'>Thursday</SelectItem>
                    <SelectItem value='5'>Friday</SelectItem>
                    <SelectItem value='6'>Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Common Examples */}
            <div className='space-y-2'>
              <Label>Common Examples:</Label>
              <div className='text-sm space-y-1'>
                <p>• Every 30 minutes: Minute: 30, leave others empty</p>
                <p>• Daily at 2:30 AM: Minute: 30, Hour: 2, leave others empty</p>
                <p>• Weekly backup on Sunday at 3:00 AM: Minute: 0, Hour: 3, Weekday: Sunday</p>
                <p>• Monthly on 1st at midnight: Minute: 0, Hour: 0, Day: 1</p>
              </div>
            </div>

            {/* CRON Expression */}
            <div className='space-y-2'>
              <Label>CRON Expression:</Label>
              <div className='flex items-center gap-2'>
                <Input
                  value={generateCronExpression()}
                  readOnly
                  className='font-mono bg-muted'
                />
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => copyToClipboard(generateCronExpression(), 'CRON Expression')}
                >
                  Copy
                </Button>
              </div>
              <p className='text-sm text-muted-foreground'>
                This policy will run based on the schedule configured above.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsCreateBackupModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateBackup}>
              Create Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

