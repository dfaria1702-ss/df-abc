'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PageLayout } from '@/components/page-layout';
import { VercelTabs } from '@/components/ui/vercel-tabs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShadcnDataTable } from '@/components/ui/shadcn-data-table';
import { ActionMenu } from '@/components/action-menu';
import { StatusBadge } from '@/components/status-badge';
import { UsageActionBar } from '@/components/billing/usage-action-bar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
// Removed PieChart imports as we're now using horizontal bar chart
import {
  ArrowDownTrayIcon,
  CalendarIcon,
  ChevronDownIcon,
  FunnelIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import type { DateRange } from 'react-day-picker';
import type { Column } from '@/components/ui/shadcn-data-table';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {
  filterBillingDataForUser,
  shouldShowEmptyState,
  getEmptyStateMessage,
} from '@/lib/demo-data-filter';
import { EmptyState } from '@/components/ui/empty-state';

// Custom infrastructure icon for Core Infrastructure empty states
const infrastructureIcon = (
  <svg
    width='466'
    height='241'
    viewBox='0 0 466 241'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='w-72'
  >
    <g opacity='0.51'>
      <path
        d='M294.9 36.11V19.88L326.611 1.35999L359.18 21.1V84.16L327.041 102.78L309.43 91.55L294.9 60.09V36.11Z'
        fill='white'
      />
      <path
        d='M166.85 93.41V44.47L238.13 3.40002L309.6 44.47V126.63L238.22 166.95L164.82 122.82L166.85 93.41Z'
        fill='white'
      />
      <path
        d='M283.392 107.238C285.926 100.032 284.192 92.8586 279.519 91.2147C274.846 89.5708 269.003 94.0793 266.468 101.285C263.934 108.49 265.667 115.663 270.341 117.307C275.014 118.951 280.857 114.443 283.392 107.238Z'
        fill='#52B54A'
      />
      <path
        d='M204.52 109.99C205.02 108.7 204.52 172.42 204.52 172.42L170.95 191.29L139.04 172.98V109.99L171.97 90.84L204.53 109.99H204.52Z'
        fill='white'
      />
    </g>
  </svg>
);

// Custom usage analytics icon
const usageAnalyticsIcon = (
  <svg
    width='467'
    height='243'
    viewBox='0 0 467 243'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='w-72'
  >
    <g opacity='0.51'>
      <path
        d='M82.71 71.23C189.18 105.86 308.45 145.19 414.63 180.7C308.16 146.07 188.89 106.74 82.71 71.23Z'
        fill='#686767'
      />
      <path
        d='M163.39 36.01L174.83 39.62L174.8 39.73L163.39 36.01Z'
        fill='#686767'
      />
      <path
        d='M186.27 43.23L197.72 46.84L197.62 47.16L186.21 43.44L186.27 43.23Z'
        fill='#686767'
      />
      <path
        d='M209.149 50.47L220.589 54.12L220.449 54.53L209.029 50.85L209.149 50.47Z'
        fill='#686767'
      />
      <path
        d='M232.02 57.76L243.45 61.41L243.3 61.9L231.88 58.22L232.02 57.76Z'
        fill='#686767'
      />
      <path
        d='M254.89 65.06L266.32 68.7L266.14 69.26L254.72 65.58L254.89 65.06Z'
        fill='#686767'
      />
      <path
        d='M277.75 72.35L289.19 75.99L288.98 76.62L277.56 72.94L277.75 72.35Z'
        fill='#686767'
      />
      <path
        d='M300.619 79.64L312.049 83.28L311.829 83.98L300.399 80.3L300.619 79.64Z'
        fill='#686767'
      />
      <path
        d='M323.48 86.95L334.9 90.63L334.69 91.29L323.26 87.64L323.48 86.95Z'
        fill='#686767'
      />
      <path
        d='M346.319 94.31L357.739 98L357.549 98.58L346.119 94.93L346.319 94.31Z'
        fill='#686767'
      />
      <path
        d='M369.159 101.68L380.579 105.36L380.419 105.87L368.989 102.22L369.159 101.68Z'
        fill='#686767'
      />
      <path
        d='M392 109.04L403.43 112.72L403.29 113.16L391.85 109.51L392 109.04Z'
        fill='#686767'
      />
      <path
        d='M414.85 116.4L426.27 120.08L426.15 120.45L414.72 116.8L414.85 116.4Z'
        fill='#686767'
      />
      <path
        d='M437.68 123.8L449.09 127.51L449.04 127.67L437.6 124.06L437.68 123.8Z'
        fill='#686767'
      />
      <path
        d='M460.5 131.23L466.33 133.12L460.479 131.28L460.5 131.23Z'
        fill='#686767'
      />
      <path
        d='M5.01953 114.31L12.6495 116.71C12.6495 116.71 12.6796 116.73 12.6696 116.75C12.6696 116.77 12.6495 116.78 12.6295 116.77L5.01953 114.31Z'
        fill='#686767'
      />
      <path
        d='M20.2799 119.11L27.9099 121.51C27.9099 121.51 27.9899 121.58 27.9699 121.63C27.9499 121.68 27.8999 121.71 27.8499 121.69L20.2398 119.23C20.2098 119.22 20.1899 119.18 20.1999 119.15C20.2099 119.12 20.2499 119.1 20.2799 119.11Z'
        fill='#686767'
      />
      <path
        d='M35.5498 123.91L43.1799 126.31C43.2599 126.34 43.3099 126.42 43.2799 126.51C43.2499 126.59 43.1698 126.64 43.0798 126.61L35.4699 124.15C35.3999 124.13 35.3699 124.06 35.3899 123.99C35.4099 123.92 35.4798 123.89 35.5498 123.91Z'
        fill='#686767'
      />
      <path
        d='M50.8099 128.71L58.4399 131.13C58.5399 131.16 58.6 131.27 58.57 131.38C58.54 131.48 58.43 131.54 58.32 131.51L50.7 129.07C50.6 129.04 50.5499 128.93 50.5799 128.83C50.6099 128.73 50.72 128.68 50.82 128.71H50.8099Z'
        fill='#686767'
      />
      <path
        d='M66.0599 133.55L73.6899 135.97C73.8099 136.01 73.8699 136.13 73.8299 136.25C73.7899 136.37 73.6699 136.43 73.5499 136.39L65.9299 133.95C65.8199 133.91 65.7599 133.8 65.7899 133.69C65.8299 133.58 65.9399 133.52 66.0499 133.55H66.0599Z'
        fill='#686767'
      />
      <path
        d='M81.3099 138.38L88.9399 140.8C89.0699 140.84 89.1399 140.98 89.0999 141.1C89.0599 141.23 88.9198 141.3 88.7998 141.26L81.1798 138.82C81.0598 138.78 80.9899 138.65 81.0299 138.53C81.0699 138.41 81.1999 138.34 81.3199 138.38H81.3099Z'
        fill='#686767'
      />
      <path
        d='M96.5594 143.22L104.189 145.64C104.329 145.68 104.409 145.83 104.359 145.97C104.319 146.11 104.169 146.19 104.029 146.14L96.4094 143.7C96.2794 143.66 96.1994 143.52 96.2494 143.38C96.2994 143.24 96.4294 143.17 96.5694 143.22H96.5594Z'
        fill='#686767'
      />
    </g>
  </svg>
);

// Data for Summary section

// Data for Summary section
const pieData = [
  { name: 'Compute', value: 1291.5, color: '#6366f1' },
  { name: 'Storage', value: 3.168, color: '#f59e42' },
  { name: 'Network', value: 0.008, color: '#10b981' },
  { name: 'Model Catalogue', value: 29.805, color: '#f43f5e' },
  { name: 'Finetuning', value: 20.75, color: '#a21caf' },
  { name: 'Deployment', value: 2972.5, color: '#eab308' },
  { name: 'Evaluation', value: 14.608, color: '#0ea5e9' },
  { name: 'Bhashik', value: 17900, color: '#f87171' },
  { name: 'DIS', value: 43810, color: '#22d3ee' },
  { name: 'Industrial Solutions', value: 1051.32, color: '#a3e635' },
];

const serviceSummary = [
  { name: 'Compute', credits: 1291.5 },
  { name: 'Storage', credits: 3.168 },
  { name: 'Network', credits: 0.008 },
  { name: 'Model Catalogue', credits: 29.805 },
  { name: 'Finetuning', credits: 20.75 },
  { name: 'Deployment', credits: 2972.5 },
  { name: 'Evaluation', credits: 14.608 },
  { name: 'Bhashik', credits: 17900 },
  { name: 'DIS', credits: 43810 },
  { name: 'Industrial Solutions', credits: 1051.32 },
  { name: 'Total', credits: 67093.659 },
];

// Data for Core Infrastructure
const mockCompute = [
  {
    id: 1,
    name: 'Production-VM-01',
    type: 'VM',
    status: 'Running',
    credits: 450,
  },
  { id: 2, name: 'Staging-VM-02', type: 'VM', status: 'Running', credits: 320 },
  { id: 3, name: 'Dev-VM-03', type: 'VM', status: 'Stopped', credits: 180 },
  { id: 4, name: 'GPU-VM-01', type: 'GPU VM', status: 'Running', credits: 750 },
  {
    id: 5,
    name: 'K8s-Node-01',
    type: 'Kubernetes',
    status: 'Running',
    credits: 280,
  },
];
const mockStorage = [
  {
    id: 1,
    name: 'Prod-Volume-01',
    type: 'SSD',
    status: 'Attached',
    credits: 120,
  },
  {
    id: 2,
    name: 'Backup-Volume-01',
    type: 'HDD',
    status: 'Available',
    credits: 80,
  },
  {
    id: 3,
    name: 'Data-Volume-01',
    type: 'SSD',
    status: 'Attached',
    credits: 150,
  },
  {
    id: 4,
    name: 'Cache-Volume-01',
    type: 'NVMe',
    status: 'Attached',
    credits: 200,
  },
  {
    id: 5,
    name: 'Archive-Volume-01',
    type: 'HDD',
    status: 'Available',
    credits: 60,
  },
];
const mockNetwork = [
  { id: 1, name: 'Prod-VPC-01', type: 'VPC', status: 'Active', credits: 90 },
  {
    id: 2,
    name: 'Prod-Subnet-01',
    type: 'Subnet',
    status: 'Active',
    credits: 45,
  },
  {
    id: 3,
    name: 'Load-Balancer-01',
    type: 'Load Balancer',
    status: 'Active',
    credits: 120,
  },
  {
    id: 4,
    name: 'Security-Group-01',
    type: 'Security Group',
    status: 'Active',
    credits: 30,
  },
  { id: 5, name: 'VPN-Gateway-01', type: 'VPN', status: 'Active', credits: 75 },
];
const allInfra = [...mockCompute, ...mockStorage, ...mockNetwork];

// Data for Studio
const mockModelCatalog = [
  { id: 1, name: 'GPT-4-32K', status: 'Active', credits: 250 },
  { id: 2, name: 'Claude-3-Opus', status: 'Active', credits: 300 },
  { id: 3, name: 'Llama-2-70B', status: 'Active', credits: 180 },
  { id: 4, name: 'Stable-Diffusion-XL', status: 'Active', credits: 150 },
  { id: 5, name: 'BERT-Large', status: 'Completed', credits: 80 },
];
const mockFinetune = [
  { id: 1, name: 'Custom-GPT-Model', status: 'Training', credits: 400 },
  { id: 2, name: 'Domain-Specific-BERT', status: 'Completed', credits: 220 },
  { id: 3, name: 'Image-Classifier-V2', status: 'Failed', credits: 150 },
];
const mockDeploy = [
  { id: 1, name: 'Production-API-v1', status: 'Running', credits: 180 },
  { id: 2, name: 'Staging-Model-Deploy', status: 'Running', credits: 90 },
  { id: 3, name: 'Dev-Environment', status: 'Stopped', credits: 45 },
];
const mockEval = [
  { id: 1, name: 'Model-Performance-Test', status: 'Completed', credits: 75 },
  { id: 2, name: 'A-B-Testing-Suite', status: 'Running', credits: 120 },
  { id: 3, name: 'Accuracy-Benchmark', status: 'Pending', credits: 60 },
];
const allStudio = [
  ...mockModelCatalog,
  ...mockFinetune,
  ...mockDeploy,
  ...mockEval,
];

// Data for Kubernetes
const mockControlPlane = [
  { clusterName: 'abc', region: 'Hyd', version: '1.33', rate: '₹7 /hr', totalTimeUsed: '10 hrs', credits: 70 },
  { clusterName: 'abc2', region: 'Blr', version: '1.33', rate: '₹7 /hr', totalTimeUsed: '10 hrs', credits: 70 },
];
const controlPlaneTotal = 140;

const mockNodePools = [
  { nodePoolName: 'xyz', clusterName: 'abc', instanceFlavour: 'AMD123', desiredVMCount: 5, rate: '₹3 /hr', totalTimeUsed: '10 hrs', credits: 30 },
  { nodePoolName: 'xyz2', clusterName: 'abc2', instanceFlavour: 'AMD1234', desiredVMCount: 3, rate: '₹10 /hr', totalTimeUsed: '10 hrs', credits: 100 },
];
const nodePoolsTotal = 130;

const mockK8sVolumes = [
  { volumeName: 'vol1', clusterName: 'abc', storageType: 'default', averageSize: '70 GB', rate: '₹5 /hr/gb', totalTimeUsed: '10 hrs', credits: 3500 },
  { volumeName: 'vol2', clusterName: 'abc2', storageType: 'default', averageSize: '100 GB', rate: '₹5 /hr/gb', totalTimeUsed: '10 hrs', credits: 5000 },
];
const k8sVolumesTotal = 8500;

const mockLoadBalancers = [
  { lbName: 'lb1', clusterName: 'abc', lbType: 'ALB', baseCharge: '₹8 /hr', totalTimeUsed: '10 hrs', totalDataProcessed: '5GB', dataProcessingCharges: '₹0.4 /GB', credits: 82 },
  { lbName: 'lb2', clusterName: 'abc2', lbType: 'ALB', baseCharge: '₹8 /hr', totalTimeUsed: '10 hrs', totalDataProcessed: '10GB', dataProcessingCharges: '₹0.4 /GB', credits: 84 },
];
const loadBalancersTotal = 166;

const mockK8sIP = [
  { ipAddress: 'ip1', clusterName: 'abc', rate: '₹0.28 /hr', totalTimeUsed: '10 hrs', credits: 2.8 },
  { ipAddress: 'ip2', clusterName: 'abc2', rate: '₹0.28 /hr', totalTimeUsed: '10 hrs', credits: 2.8 },
];
const k8sIPTotal = 5.6;

// Data for Solutions
const mockBasic = [
  { id: 1, name: 'Basic-AI-Service-01', status: 'Active', credits: 120 },
  { id: 2, name: 'Basic-NLP-Service-01', status: 'Active', credits: 90 },
  { id: 3, name: 'Basic-Vision-Service-01', status: 'Active', credits: 110 },
  { id: 4, name: 'Basic-Speech-Service-01', status: 'Completed', credits: 70 },
  { id: 5, name: 'Basic-Embedding-Service-01', status: 'Active', credits: 85 },
];
const mockDocInt = [
  { id: 1, name: 'Invoice-Processing-AI', status: 'Active', credits: 200 },
  { id: 2, name: 'Contract-Analysis-Tool', status: 'Active', credits: 180 },
  { id: 3, name: 'Document-Classification', status: 'Paused', credits: 90 },
];
const mockIndustrial = [
  { id: 1, name: 'Manufacturing-Optimizer', status: 'Running', credits: 350 },
  { id: 2, name: 'Supply-Chain-AI', status: 'Active', credits: 280 },
  { id: 3, name: 'Quality-Control-Vision', status: 'Active', credits: 150 },
];
const allSolutions = [...mockBasic, ...mockDocInt, ...mockIndustrial];

function getTotalCredits(data: Array<{ credits?: number }>): number {
  return data.reduce(
    (sum: number, row: { credits?: number }) => sum + (row.credits || 0),
    0
  );
}

function renderCustomizedLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill='#22223b'
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline='central'
      fontSize={13}
      fontWeight={600}
    >
      {percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
    </text>
  );
}

const tabs = [
  { id: 'summary', label: 'Summary' },
  { id: 'core', label: 'Core Infrastructure' },
  { id: 'studio', label: 'AI Studio' },
  { id: 'solutions', label: 'AI Solutions' },
];

// Add default date range
const defaultDateRange: DateRange = {
  from: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
  to: new Date(), // today
};

// Separate component for expandable node pool rows
function NodePoolRow({ nodePool, index }: { nodePool: any; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr className='border-b transition-colors hover:bg-gray-50/40'>
        <td className='px-3 py-2'>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='p-0 hover:bg-transparent flex items-center'
          >
            <ChevronRightIcon 
              className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>
        </td>
        <td className='px-3 py-2 font-semibold'>{nodePool.nodePoolName}</td>
        <td className='px-3 py-2'>{nodePool.instanceFlavour}</td>
        <td className='px-3 py-2 text-center'>{nodePool.desiredVMCount}</td>
        <td className='px-3 py-2'>{nodePool.rate}</td>
        <td className='px-3 py-2 text-center'>{nodePool.totalTimeUsed}</td>
        <td className='px-3 py-2 text-right font-semibold'>₹{nodePool.credits.toLocaleString()}</td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={7} className='p-0 bg-gray-50/50'>
            <div className='px-3 py-2'>
              <div className='rounded-md border bg-white'>
                <table className='min-w-full text-sm'>
                  <thead>
                    <tr className='bg-blue-50'>
                      <th className='px-3 py-2 text-left text-muted-foreground font-medium'>VM Name</th>
                      <th className='px-3 py-2 text-left text-muted-foreground font-medium'>Status</th>
                      <th className='px-3 py-2 text-center text-muted-foreground font-medium'>Total Time Used</th>
                      <th className='px-3 py-2 text-left text-muted-foreground font-medium'>Rate</th>
                      <th className='px-3 py-2 text-right text-muted-foreground font-medium'>Total Credits Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className='border-b transition-colors hover:bg-gray-50/40'>
                      <td className='px-3 py-2'>vm-node-001</td>
                      <td className='px-3 py-2'>
                        <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                          Running
                        </span>
                      </td>
                      <td className='px-3 py-2 text-center'>10 hrs</td>
                      <td className='px-3 py-2'>₹3 /hr</td>
                      <td className='px-3 py-2 text-right font-semibold'>₹30.00</td>
                    </tr>
                    <tr className='border-b transition-colors hover:bg-gray-50/40'>
                      <td className='px-3 py-2'>vm-node-002</td>
                      <td className='px-3 py-2'>
                        <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                          Running
                        </span>
                      </td>
                      <td className='px-3 py-2 text-center'>10 hrs</td>
                      <td className='px-3 py-2'>₹3 /hr</td>
                      <td className='px-3 py-2 text-right font-semibold'>₹30.00</td>
                    </tr>
                    <tr className='transition-colors hover:bg-gray-50/40'>
                      <td className='px-3 py-2'>vm-node-003</td>
                      <td className='px-3 py-2'>
                        <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                          Running
                        </span>
                      </td>
                      <td className='px-3 py-2 text-center'>10 hrs</td>
                      <td className='px-3 py-2'>₹3 /hr</td>
                      <td className='px-3 py-2 text-right font-semibold'>₹30.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function UsageMetricsPage() {
  const pathname = usePathname();

  // State for main tabs
  const getActiveTabFromPath = () => {
    if (pathname.includes('/summary')) {
      return 'summary';
    }
    if (pathname.includes('/core')) {
      return 'core';
    }
    if (pathname.includes('/kubernetes')) {
      return 'kubernetes';
    }
    if (pathname.includes('/studio')) {
      return 'studio';
    }
    if (pathname.includes('/solutions')) {
      return 'solutions';
    }
    return 'summary';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
  const [date, setDate] = useState<DateRange | undefined>(defaultDateRange);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalResource, setModalResource] = useState<any>(null);

  // State for nested tabs
  const [coreTab, setCoreTab] = useState('compute');
  // Removed top-level Kubernetes tab
  const [studioTab, setStudioTab] = useState('model');
  const [solutionsTab, setSolutionsTab] = useState('bhashik');

  // State for cluster details drawer
  const [clusterDrawerOpen, setClusterDrawerOpen] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<any>(null);

  // Apply demo user filtering to all billing data
  const filteredPieData = filterBillingDataForUser(pieData);
  const filteredServiceSummary = filterBillingDataForUser(serviceSummary);
  const filteredMockCompute = filterBillingDataForUser(mockCompute);
  const filteredMockStorage = filterBillingDataForUser(mockStorage);
  const filteredMockNetwork = filterBillingDataForUser(mockNetwork);
  const filteredAllInfra = filterBillingDataForUser(allInfra);
  const filteredMockModelCatalog = filterBillingDataForUser(mockModelCatalog);
  const filteredMockFinetune = filterBillingDataForUser(mockFinetune);
  const filteredMockDeploy = filterBillingDataForUser(mockDeploy);
  const filteredMockEval = filterBillingDataForUser(mockEval);
  const filteredAllStudio = filterBillingDataForUser(allStudio);
  const filteredMockControlPlane = filterBillingDataForUser(mockControlPlane);
  const filteredMockNodePools = filterBillingDataForUser(mockNodePools);
  const filteredMockK8sVolumes = filterBillingDataForUser(mockK8sVolumes);
  const filteredMockLoadBalancers = filterBillingDataForUser(mockLoadBalancers);
  const filteredMockK8sIP = filterBillingDataForUser(mockK8sIP);
  const filteredMockBasic = filterBillingDataForUser(mockBasic);
  const filteredMockDocInt = filterBillingDataForUser(mockDocInt);
  const filteredMockIndustrial = filterBillingDataForUser(mockIndustrial);
  const filteredAllSolutions = filterBillingDataForUser(allSolutions);

  const showEmptyState = shouldShowEmptyState();

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleViewClusterDetails = (cluster: any) => {
    setSelectedCluster(cluster);
    setClusterDrawerOpen(true);
  };

  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [pathname]);

  // Summary Section Component
  const SummarySection = () => {
    if (showEmptyState) {
      return (
        <EmptyState
          title='No Usage Data Yet'
          description='Start using Krutrim Cloud services to see your usage summary, billing breakdown, and credit consumption here.'
          className='min-h-[400px]'
          icon={usageAnalyticsIcon}
        />
      );
    }

    const totalAvailableCredits = 69187.32; // Updated to show desired remaining credits
    const totalUsedCredits = 67093.659;
    const remainingCredits = totalAvailableCredits - totalUsedCredits;

    // Calculate percentages for horizontal bar chart
    const barChartData = filteredPieData
      .map(item => ({
        ...item,
        percentage: ((item.value / totalUsedCredits) * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending for better visual hierarchy

    const columns: Column<any>[] = [
      {
        key: 'name',
        label: 'Service',
        sortable: true,
        searchable: true,
        render: (value: string) => (
          <div className='font-medium text-sm'>{value}</div>
        ),
      },
      {
        key: 'credits',
        label: 'Total Credits used',
        sortable: true,
        searchable: true,
        render: (value: number) => (
          <div className='text-sm'>
            ₹{value.toLocaleString(undefined, { minimumFractionDigits: 3 })}
          </div>
        ),
      },
    ];
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col lg:flex-row items-start justify-between gap-4 w-full'>
            {/* Remaining Balance Card - Matching Enter amount style */}
            <div className='flex flex-col items-center justify-center flex-shrink-0'>
              <div
                className='w-full min-w-[280px] text-center'
                style={{
                  borderRadius: '16px',
                  border: '4px solid #FFF',
                  background:
                    'linear-gradient(265deg, #FFF -13.17%, #F7F8FD 133.78%)',
                  boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)',
                  padding: '1.5rem',
                }}
              >
                <div className='mb-3'>
                  <div className='text-lg text-muted-foreground'>
                    Remaining Balance
                  </div>
                </div>
                <div className='text-3xl font-bold text-black mb-2'>
                  ₹
                  {remainingCredits.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className='text-sm text-black bg-green-100 rounded-full px-3 py-1 inline-block'>
                  Available for use
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className='hidden lg:block h-80 border-l border-gray-200 mx-4' />

            {/* Clean Horizontal Bar Chart Section */}
            <div className='flex-1 w-full'>
              <div>
                <div className='flex items-start justify-start'>
                  <div className='flex flex-col'>
                    <span className='text-sm text-muted-foreground'>
                      Total Credits Used
                    </span>
                    <span className='text-lg font-semibold text-gray-900'>
                      ₹
                      {totalUsedCredits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* Clean Highcharts Horizontal Bar Chart */}
                <div className='h-[350px] w-full bg-white rounded-lg p-4'>
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={{
                      chart: {
                        type: 'bar',
                        height: 300,
                        backgroundColor: 'transparent',
                        margin: [20, 80, 50, 160],
                        style: {
                          fontFamily: 'inherit',
                        },
                      },
                      title: {
                        text: null,
                      },
                      xAxis: {
                        categories: barChartData.map(item => item.name),
                        title: {
                          text: null,
                        },
                        labels: {
                          style: {
                            color: '#374151',
                            fontSize: '13px',
                            fontWeight: 'normal',
                          },
                        },
                        lineWidth: 0,
                        tickWidth: 0,
                        gridLineWidth: 0,
                      },
                      yAxis: {
                        min: 0,
                        max:
                          Math.max(...barChartData.map(item => item.value)) *
                          1.1,
                        title: {
                          text: null,
                        },
                        labels: {
                          enabled: true,
                          style: {
                            color: '#9ca3af',
                            fontSize: '11px',
                          },
                          formatter: function (this: any): string {
                            return (
                              '₹' +
                              (this.value >= 1000
                                ? Math.round(this.value / 1000) + 'k'
                                : this.value)
                            );
                          },
                        },
                        gridLineWidth: 1,
                        gridLineColor: '#f3f4f6',
                        tickInterval:
                          Math.max(...barChartData.map(item => item.value)) / 4,
                      },
                      tooltip: {
                        pointFormat:
                          '<b>{point.category}</b><br/>Credits Used: <b>₹{point.y:,.0f}</b>',
                        backgroundColor: '#000000',
                        borderColor: '#000000',
                        borderRadius: 6,
                        shadow: false,
                        style: {
                          fontSize: '12px',
                          color: '#ffffff',
                        },
                      },
                      plotOptions: {
                        bar: {
                          dataLabels: {
                            enabled: true,
                            format: '₹{point.y:,.0f}',
                            align: 'left',
                            inside: false,
                            x: 8,
                            crop: false,
                            overflow: 'allow',
                            style: {
                              color: '#374151',
                              fontSize: '12px',
                              fontWeight: 'normal',
                            },
                          },
                          borderRadius: {
                            radius: 4,
                            scope: 'point',
                          },
                          pointPadding: 0.08,
                          groupPadding: 0.1,
                          borderWidth: 0,
                        },
                      },
                      legend: {
                        enabled: false,
                      },
                      credits: {
                        enabled: false,
                      },
                      series: [
                        {
                          name: 'Credits Used',
                          data: barChartData.map(item => ({
                            y: item.value,
                            color: '#3b82f6', // All bars blue
                            name: item.name,
                          })),
                          showInLegend: false,
                        },
                      ],
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Core Infrastructure Section Component
  const CoreInfrastructureSection = () => {
    const coreTabs = [
      { id: 'compute', label: 'Compute' },
      { id: 'storage', label: 'Storage' },
      { id: 'network', label: 'Network' },
      { id: 'kubernetes', label: 'Kubernetes' },
    ];

    // Data for each tab (updated to match VPC structure)
    const computeData = [
      {
        name: 'Machine1',
        type: 'GPU VM',
        flavor: 'A100-NVLINK-1x',
        time: '10 hrs 15 mins',
        rate: '₹105 per hour',
        credits: 1076.25,
      },
      {
        name: 'Machine2',
        type: 'CPU VM',
        flavor: 'CPU-2x-8GB',
        time: '10 hrs 15 mins',
        rate: '₹6.00 per hour',
        credits: 61.5,
      },
      {
        name: 'Machine3',
        type: 'AI Pods',
        flavor: 'A100-NVLINK-Tiny',
        time: '10 hrs 15 mins',
        rate: '₹15 per hour',
        credits: 153.75,
      },
    ];
    const computeTotal = 1291.5;

    const storageData = [
      {
        name: 'Test 1',
        type: 'Volume disk in Pods',
        time: '10 hrs 15mins',
        size: '10 GB',
        rate: '₹ 0.0058/GB/Hr',
        credits: 0.5945,
      },
      {
        name: 'Test 2',
        type: 'Container disk in Pods',
        time: '10 hrs 15mins',
        size: '10 GB',
        rate: '₹ 0.0058/GB/Hr',
        credits: 0.5945,
      },
      {
        name: 'Test 3',
        type: 'Object Storage',
        time: '10 hrs 15mins',
        size: '10 GB',
        rate: '₹1.61/GB/Month',
        credits: 0.2292,
      },
      {
        name: 'Test 4',
        type: 'Volumes',
        time: '10 hrs 15mins',
        size: '10 GB',
        rate: '₹5.95/GB/Month',
        credits: 0.847,
      },
      {
        name: 'Test 5',
        type: 'Snapshot',
        time: '10 hrs 15mins',
        size: '10 GB',
        rate: '₹4.25/GB/Month',
        credits: 0.605,
      },
      {
        name: 'Test 6',
        type: 'Backup',
        time: '10 hrs 15mins',
        size: '10 GB',
        rate: '₹2.09/GB/Month',
        credits: 0.2975,
      },
    ];
    const storageTotal = 3.168;

    const networkData = [
      {
        name: 'VPC_1',
        type: 'VPC',
        time: '10 hrs',
        rate: '₹0.28 /VPC/Month',
        credits: 0.004,
      },
      {
        name: '192.1.1.1',
        type: 'IP Address',
        time: '10 hrs',
        rate: '₹0.28 /IP Address/Month',
        credits: 0.004,
      },
    ];
    const networkTotal = 0.008;

    // Render table for each tab
    const renderTable = () => {
      if (showEmptyState) {
        if (coreTab === 'compute') {
          return (
            <EmptyState
              title='No Compute Usage Yet'
              description='Your compute instances, VMs, and processing costs will appear here once you start using our compute services.'
              className='min-h-[300px]'
              icon={infrastructureIcon}
            />
          );
        }
        if (coreTab === 'storage') {
          return (
            <EmptyState
              title='No Storage Usage Yet'
              description='Your block storage, object storage, and data storage costs will appear here once you start using our storage services.'
              className='min-h-[300px]'
              icon={infrastructureIcon}
            />
          );
        }
        if (coreTab === 'network') {
          return (
            <EmptyState
              title='No Network Usage Yet'
              description='Your networking, bandwidth, and data transfer costs will appear here once you start using our network services.'
              className='min-h-[300px]'
              icon={infrastructureIcon}
            />
          );
        }
      }

      if (coreTab === 'compute') {
        return (
          <div className='rounded-md border mt-4'>
            <table className='min-w-full text-sm table-fixed'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium rounded-tl-md'>
                    Machine name
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Type of service
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Flavour
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Total used time
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Rate
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium rounded-tr-md'>
                    Total credits used
                  </th>
                </tr>
              </thead>
              <tbody>
                {computeData.map((row, idx) => (
                  <tr
                    key={idx}
                    className='border-b transition-colors hover:bg-gray-50/40'
                  >
                    <td className='px-3 py-2'>{row.name}</td>
                    <td className='px-3 py-2'>{row.type}</td>
                    <td className='px-3 py-2'>{row.flavor}</td>
                    <td className='px-3 py-2'>{row.time}</td>
                    <td className='px-3 py-2'>{row.rate}</td>
                    <td className='px-3 py-2 text-right font-semibold'>
                      ₹
                      {row.credits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className='font-bold'>
                  <td className='rounded-bl-md'></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='px-3 py-2 text-right align-middle font-bold rounded-br-md'>
                    Total&nbsp;&nbsp;&nbsp;₹
                    {computeTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      if (coreTab === 'storage') {
        return (
          <div className='rounded-md border mt-4'>
            <table className='min-w-full text-sm table-fixed'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium rounded-tl-md'>
                    Name
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Storage Type
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Total used time
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Average Size
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Rate
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium rounded-tr-md'>
                    Total credits used
                  </th>
                </tr>
              </thead>
              <tbody>
                {storageData.map((row, idx) => (
                  <tr
                    key={idx}
                    className='border-b transition-colors hover:bg-gray-50/40'
                  >
                    <td className='px-3 py-2'>{row.name}</td>
                    <td className='px-3 py-2'>{row.type}</td>
                    <td className='px-3 py-2'>{row.time}</td>
                    <td className='px-3 py-2'>{row.size}</td>
                    <td className='px-3 py-2'>{row.rate}</td>
                    <td className='px-3 py-2 text-right font-semibold'>
                      ₹
                      {row.credits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className='font-bold'>
                  <td className='rounded-bl-md'></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='px-3 py-2 text-right align-middle font-bold rounded-br-md'>
                    Total&nbsp;&nbsp;&nbsp;₹
                    {storageTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      if (coreTab === 'network') {
        return (
          <div className='rounded-md border mt-4'>
            <table className='min-w-full text-sm table-fixed'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium rounded-tl-md'>
                    Name
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Service type
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Total used time
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Rate
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium rounded-tr-md'>
                    Total credits used
                  </th>
                </tr>
              </thead>
              <tbody>
                {networkData.map((row, idx) => (
                  <tr
                    key={idx}
                    className='border-b transition-colors hover:bg-gray-50/40'
                  >
                    <td className='px-3 py-2'>{row.name}</td>
                    <td className='px-3 py-2'>{row.type}</td>
                    <td className='px-3 py-2'>{row.time}</td>
                    <td className='px-3 py-2'>{row.rate}</td>
                    <td className='px-3 py-2 text-right'>
                      ₹
                      {row.credits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className='font-bold'>
                  <td className='rounded-bl-md'></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='px-3 py-2 text-right align-middle font-bold rounded-br-md'>
                    Total&nbsp;&nbsp;&nbsp;₹
                    {networkTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      if (coreTab === 'kubernetes') {
        return (
          <div className='rounded-md border mt-4'>
            <table className='min-w-full text-sm table-fixed'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium rounded-tl-md w-1/6'>
                    Cluster Name
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/6'>
                    Region
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/6'>
                    Version
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/6'>
                    Rate
                  </th>
                  <th className='px-3 py-2 text-center text-muted-foreground font-medium w-1/6'>
                    Total Time Used
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium w-1/6 rounded-tr-md'>
                    Total Credits Used
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMockControlPlane.map((row: any, idx: number) => (
                  <tr key={idx} className='border-b transition-colors hover:bg-gray-50/40'>
                    <td className='px-3 py-2'>
                      <button
                        onClick={() => handleViewClusterDetails(row)}
                        className='text-primary font-medium underline cursor-pointer'
                      >
                        {row.clusterName}
                      </button>
                    </td>
                    <td className='px-3 py-2'>{row.region}</td>
                    <td className='px-3 py-2'>{row.version}</td>
                    <td className='px-3 py-2'>{row.rate}</td>
                    <td className='px-3 py-2 text-center'>{row.totalTimeUsed}</td>
                    <td className='px-3 py-2 text-right font-semibold'>
                      ₹
                      {row.credits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className='font-bold'>
                  <td className='rounded-bl-md'></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='px-3 py-2 text-right align-middle font-bold rounded-br-md' colSpan={2}>
                    Total&nbsp;&nbsp;&nbsp;₹
                    {controlPlaneTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      return null;
    };

    return (
      <Card>
        <CardContent className='pt-6'>
          <VercelTabs
            tabs={coreTabs}
            activeTab={coreTab}
            onTabChange={setCoreTab}
            size='md'
            className='mb-4'
          />
          {renderTable()}
        </CardContent>
      </Card>
    );
  };

  // Studio Section Component
  const StudioSection = () => {
    const studioTabs = [
      { id: 'model', label: 'Model Catalogue' },
      { id: 'finetune', label: 'Fine Tuning' },
      { id: 'deploy', label: 'Deployment' },
      { id: 'eval', label: 'Evaluation' },
    ];

    // Data for each tab (updated to match VPC structure)
    const modelData = [
      {
        name: 'Phi 4 Reasoning plus',
        inputOutput: 'Input',
        unit: 'Token',
        usedUnit: '1000',
        rate: '₹5.00 per 1M token',
        credits: 0.01,
      },
      {
        name: 'Phi 4 Reasoning plus',
        inputOutput: 'Output',
        unit: 'Token',
        usedUnit: '1000000',
        rate: '₹29.00 per 1M token',
        credits: 29.0,
      },
      {
        name: 'Speecht5-TTS',
        inputOutput: 'Output',
        unit: 'Minute of output audio',
        usedUnit: '10',
        rate: '₹0.04 per minute of output audio',
        credits: 0.4,
      },
      {
        name: 'Whisper-large-v3',
        inputOutput: 'Input',
        unit: 'Minute of input audio',
        usedUnit: '10',
        rate: '₹0.04 per minute of input audio',
        credits: 0.4,
      },
    ];
    const modelTotal = 29.81;

    const finetuneData = [
      {
        jobName: 'Job 1',
        model: 'Llama-3-70B',
        unit: 'Token',
        usedUnit: '100000',
        rate: '₹207.50 per 1M Token',
        credits: 20.75,
      },
    ];
    const finetuneTotal = 20.75;

    const deployData = [
      {
        name: 'Model 1',
        flavour: 'MaaS-H100-80GB-1-Node',
        time: '10 Hrs 15 mins',
        rate: '₹290.00 per hour',
        credits: 2972.5,
      },
    ];
    const deployTotal = 2972.5;

    const evalData = [
      {
        evaluationName: 'Main',
        model: 'Llama 3.1 70B',
        inputOutput: 'Input',
        unit: 'Token',
        usedUnit: '100000',
        rate: '₹73.04 per 1 M Token',
        credits: 7.304,
      },
      {
        evaluationName: 'Main',
        model: 'Llama 3.1 70B',
        inputOutput: 'Output',
        unit: 'Token',
        usedUnit: '100000',
        rate: '₹73.04 per 1 M Token',
        credits: 7.304,
      },
    ];
    const evalTotal = 14.61;

    // Render table for each tab
    const renderTable = () => {
      if (showEmptyState) {
        if (studioTab === 'model') {
          return (
            <EmptyState
              title='No Model Usage Yet'
              description='Your AI model inference and API calls will be tracked here once you start using our model catalogue services.'
              className='min-h-[300px]'
            />
          );
        }
        if (studioTab === 'finetune') {
          return (
            <EmptyState
              title='No Fine-tuning Jobs Yet'
              description='Your model fine-tuning jobs and training costs will appear here once you start customizing models.'
              className='min-h-[300px]'
            />
          );
        }
        if (studioTab === 'deploy') {
          return (
            <EmptyState
              title='No Model Deployments Yet'
              description='Your deployed model instances and hosting costs will be shown here once you start deploying models.'
              className='min-h-[300px]'
            />
          );
        }
        if (studioTab === 'eval') {
          return (
            <EmptyState
              title='No Model Evaluations Yet'
              description='Your model evaluation runs and testing costs will be tracked here once you start evaluating models.'
              className='min-h-[300px]'
            />
          );
        }
      }

      if (studioTab === 'model') {
        return (
          <div className='rounded-md border mt-4'>
            <table className='min-w-full text-sm table-fixed'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium rounded-tl-md'>
                    Model
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Input/Output
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Unit
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Used Unit
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Rate
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium rounded-tr-md'>
                    Total Credit used
                  </th>
                </tr>
              </thead>
              <tbody>
                {modelData.map((row, idx) => (
                  <tr
                    key={idx}
                    className='border-b transition-colors hover:bg-gray-50/40'
                  >
                    <td className='px-3 py-2'>{row.name}</td>
                    <td className='px-3 py-2'>{row.inputOutput}</td>
                    <td className='px-3 py-2'>{row.unit}</td>
                    <td className='px-3 py-2'>{row.usedUnit}</td>
                    <td className='px-3 py-2'>{row.rate}</td>
                    <td className='px-3 py-2 text-right'>
                      ₹
                      {row.credits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className='font-bold'>
                  <td className='rounded-bl-md'></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='px-3 py-2 text-right align-middle font-bold rounded-br-md'>
                    Total&nbsp;&nbsp;&nbsp;₹
                    {modelTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      if (studioTab === 'finetune') {
        return (
          <div className='rounded-md border mt-4'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium rounded-tl-md'>
                    Job name
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Model
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Unit
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Used Unit
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Rate
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium rounded-tr-md'>
                    Total Credit used
                  </th>
                </tr>
              </thead>
              <tbody>
                {finetuneData.map((row, idx) => (
                  <tr
                    key={idx}
                    className='border-b transition-colors hover:bg-gray-50/40'
                  >
                    <td className='px-3 py-2'>{row.jobName}</td>
                    <td className='px-3 py-2'>{row.model}</td>
                    <td className='px-3 py-2'>{row.unit}</td>
                    <td className='px-3 py-2'>{row.usedUnit}</td>
                    <td className='px-3 py-2'>{row.rate}</td>
                    <td className='px-3 py-2 text-right'>
                      ₹
                      {row.credits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className='font-bold'>
                  <td className='rounded-bl-md'></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='px-3 py-2 text-right align-middle font-bold rounded-br-md'>
                    Total&nbsp;&nbsp;&nbsp;₹
                    {finetuneTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      if (studioTab === 'deploy') {
        return (
          <div className='rounded-md border mt-4'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium rounded-tl-md'>
                    Name
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Flavour
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Total used time
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Rate
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium rounded-tr-md'>
                    Total credits used
                  </th>
                </tr>
              </thead>
              <tbody>
                {deployData.map((row, idx) => (
                  <tr
                    key={idx}
                    className='border-b transition-colors hover:bg-gray-50/40'
                  >
                    <td className='px-3 py-2'>{row.name}</td>
                    <td className='px-3 py-2'>{row.flavour}</td>
                    <td className='px-3 py-2'>{row.time}</td>
                    <td className='px-3 py-2'>{row.rate}</td>
                    <td className='px-3 py-2 text-right'>
                      ₹
                      {row.credits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className='font-bold'>
                  <td className='rounded-bl-md'></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='px-3 py-2 text-right align-middle font-bold rounded-br-md'>
                    Total&nbsp;&nbsp;&nbsp;₹
                    {deployTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      if (studioTab === 'eval') {
        return (
          <div className='rounded-md border mt-4'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium rounded-tl-md'>
                    Evaluation Name
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Model
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Input/Output
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Unit
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Used Unit
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Rate
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium rounded-tr-md'>
                    Total Credit used
                  </th>
                </tr>
              </thead>
              <tbody>
                {evalData.map((row, idx) => (
                  <tr
                    key={idx}
                    className='border-b transition-colors hover:bg-gray-50/40'
                  >
                    <td className='px-3 py-2'>{row.evaluationName}</td>
                    <td className='px-3 py-2'>{row.model}</td>
                    <td className='px-3 py-2'>{row.inputOutput}</td>
                    <td className='px-3 py-2'>{row.unit}</td>
                    <td className='px-3 py-2'>{row.usedUnit}</td>
                    <td className='px-3 py-2'>{row.rate}</td>
                    <td className='px-3 py-2 text-right'>
                      {row.credits.toLocaleString(undefined, {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className='font-bold'>
                  <td className='rounded-bl-md'></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='px-3 py-2 text-right align-middle font-bold rounded-br-md'>
                    Total&nbsp;&nbsp;&nbsp;₹
                    {evalTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      return null;
    };

    return (
      <Card>
        <CardContent className='pt-6'>
          <VercelTabs
            tabs={studioTabs}
            activeTab={studioTab}
            onTabChange={setStudioTab}
            size='md'
            className='mb-4'
          />
          {renderTable()}
        </CardContent>
      </Card>
    );
  };

  // Kubernetes Section Component
  const KubernetesSection = () => {
    const kubernetesTabs = [
      { id: 'controlPlane', label: 'Control Plane' },
    ];

    // Render table for each tab
    const renderTable = () => {
      if (showEmptyState) {
        if (kubernetesTab === 'controlPlane') {
          return (
            <EmptyState
              title='No Control Plane Usage Yet'
              description='Your Kubernetes cluster control plane usage and costs will appear here once you start using our Kubernetes services.'
              className='min-h-[300px]'
              icon={infrastructureIcon}
            />
          );
        }
        if (kubernetesTab === 'nodePools') {
          return (
            <EmptyState
              title='No Node Pool Usage Yet'
              description='Your Kubernetes node pool usage and compute costs will appear here once you create node pools.'
              className='min-h-[300px]'
              icon={infrastructureIcon}
            />
          );
        }
        if (kubernetesTab === 'volumes') {
          return (
            <EmptyState
              title='No Volume Usage Yet'
              description='Your Kubernetes persistent volume usage and storage costs will appear here once you create volumes.'
              className='min-h-[300px]'
              icon={infrastructureIcon}
            />
          );
        }
        if (kubernetesTab === 'loadBalancers') {
          return (
            <EmptyState
              title='No Load Balancer Usage Yet'
              description='Your Kubernetes load balancer usage and data transfer costs will appear here once you create load balancers.'
              className='min-h-[300px]'
              icon={infrastructureIcon}
            />
          );
        }
        if (kubernetesTab === 'ip') {
          return (
            <EmptyState
              title='No IP Address Usage Yet'
              description='Your Kubernetes IP address allocations and costs will appear here once you allocate IP addresses.'
              className='min-h-[300px]'
              icon={infrastructureIcon}
            />
          );
        }
      }

      if (kubernetesTab === 'controlPlane') {
        return (
          <div className='rounded-md border mt-4'>
            <table className='min-w-full text-sm table-fixed'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium rounded-tl-md w-1/6'>
                    Cluster Name
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/6'>
                    Region
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/6'>
                    Version
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/6'>
                    Rate
                  </th>
                  <th className='px-3 py-2 text-center text-muted-foreground font-medium w-1/6'>
                    Total Time Used
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium w-1/6 rounded-tr-md'>
                    Total Credits Used
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMockControlPlane.map((row: any, idx: number) => (
                  <tr
                    key={idx}
                    className='border-b transition-colors hover:bg-gray-50/40'
                  >
                    <td className='px-3 py-2'>
                      <button
                        onClick={() => handleViewClusterDetails(row)}
                        className='text-primary font-medium underline cursor-pointer'
                      >
                        {row.clusterName}
                      </button>
                    </td>
                    <td className='px-3 py-2'>{row.region}</td>
                    <td className='px-3 py-2'>{row.version}</td>
                    <td className='px-3 py-2'>{row.rate}</td>
                    <td className='px-3 py-2 text-center'>{row.totalTimeUsed}</td>
                    <td className='px-3 py-2 text-right'>
                      ₹
                      {row.credits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    
                  </tr>
                ))}
                <tr className='font-bold'>
                  <td className='rounded-bl-md'></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='px-3 py-2 text-right align-middle font-bold rounded-br-md' colSpan={2}>
                    Total&nbsp;&nbsp;&nbsp;₹
                    {controlPlaneTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      if (kubernetesTab === 'nodePools') {
        return (
          <div className='rounded-md border mt-4'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium rounded-tl-md w-1/7'>
                    Node Pool Name
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/7'>
                    Cluster Name
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/7'>
                    Instance Flavour
                  </th>
                  <th className='px-3 py-2 text-center text-muted-foreground font-medium w-1/7'>
                    Desired VM Count
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/7'>
                    Rate
                  </th>
                  <th className='px-3 py-2 text-center text-muted-foreground font-medium w-1/7'>
                    Total Time Used
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium rounded-tr-md w-1/7'>
                    Total Credits Used
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMockNodePools.map((row: any, idx: number) => (
                  <tr
                    key={idx}
                    className='border-b transition-colors hover:bg-gray-50/40'
                  >
                    <td className='px-3 py-2'>{row.nodePoolName}</td>
                    <td className='px-3 py-2'>{row.clusterName}</td>
                    <td className='px-3 py-2'>{row.instanceFlavour}</td>
                    <td className='px-3 py-2 text-center'>{row.desiredVMCount}</td>
                    <td className='px-3 py-2'>{row.rate}</td>
                    <td className='px-3 py-2 text-center'>{row.totalTimeUsed}</td>
                    <td className='px-3 py-2 text-right'>
                      ₹
                      {row.credits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className='font-bold'>
                  <td className='rounded-bl-md'></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='px-3 py-2 text-right align-middle font-bold rounded-br-md'>
                    Total&nbsp;&nbsp;&nbsp;₹
                    {nodePoolsTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      if (kubernetesTab === 'volumes') {
        return (
          <div className='rounded-md border mt-4'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium rounded-tl-md w-1/7'>
                    Volume Name
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/7'>
                    Cluster Name
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/7'>
                    Storage Type
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/7'>
                    Average Size
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/7'>
                    Rate
                  </th>
                  <th className='px-3 py-2 text-center text-muted-foreground font-medium w-1/7'>
                    Total Time Used
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium rounded-tr-md w-1/7'>
                    Total Credits Used
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMockK8sVolumes.map((row: any, idx: number) => (
                  <tr
                    key={idx}
                    className='border-b transition-colors hover:bg-gray-50/40'
                  >
                    <td className='px-3 py-2'>{row.volumeName}</td>
                    <td className='px-3 py-2'>{row.clusterName}</td>
                    <td className='px-3 py-2'>{row.storageType}</td>
                    <td className='px-3 py-2'>{row.averageSize}</td>
                    <td className='px-3 py-2'>{row.rate}</td>
                    <td className='px-3 py-2 text-center'>{row.totalTimeUsed}</td>
                    <td className='px-3 py-2 text-right'>
                      ₹
                      {row.credits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className='font-bold'>
                  <td className='rounded-bl-md'></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='px-3 py-2 text-right align-middle font-bold rounded-br-md'>
                    Total&nbsp;&nbsp;&nbsp;₹
                    {k8sVolumesTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      if (kubernetesTab === 'loadBalancers') {
        return (
          <div className='rounded-md border mt-4'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium rounded-tl-md w-1/8'>
                    LB Name
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/8'>
                    Cluster Name
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/8'>
                    LB Type
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium w-1/8'>
                    Base Charge
                  </th>
                  <th className='px-3 py-2 text-center text-muted-foreground font-medium w-1/8'>
                    Total Time Used
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/8'>
                    Total Data Processed
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium w-1/8'>
                    Data Processing Charges
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium rounded-tr-md w-1/8'>
                    Total Credits Used
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMockLoadBalancers.map((row: any, idx: number) => (
                  <tr
                    key={idx}
                    className='border-b transition-colors hover:bg-gray-50/40'
                  >
                    <td className='px-3 py-2'>{row.lbName}</td>
                    <td className='px-3 py-2'>{row.clusterName}</td>
                    <td className='px-3 py-2'>{row.lbType}</td>
                    <td className='px-3 py-2 text-right'>{row.baseCharge}</td>
                    <td className='px-3 py-2 text-center'>{row.totalTimeUsed}</td>
                    <td className='px-3 py-2 text-center'>{row.totalDataProcessed}</td>
                    <td className='px-3 py-2 text-right'>{row.dataProcessingCharges}</td>
                    <td className='px-3 py-2 text-right'>
                      ₹
                      {row.credits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className='font-bold'>
                  <td className='rounded-bl-md'></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='px-3 py-2 text-right align-middle font-bold rounded-br-md'>
                    Total&nbsp;&nbsp;&nbsp;₹
                    {loadBalancersTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      if (kubernetesTab === 'ip') {
        return (
          <div className='rounded-md border mt-4'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium rounded-tl-md w-1/5'>
                    IP Address
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/5'>
                    Cluster Name
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/5'>
                    Rate
                  </th>
                  <th className='px-3 py-2 text-center text-muted-foreground font-medium w-1/5'>
                    Total Time Used
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium rounded-tr-md w-1/5'>
                    Total Credits Used
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMockK8sIP.map((row: any, idx: number) => (
                  <tr
                    key={idx}
                    className='border-b transition-colors hover:bg-gray-50/40'
                  >
                    <td className='px-3 py-2'>{row.ipAddress}</td>
                    <td className='px-3 py-2'>{row.clusterName}</td>
                    <td className='px-3 py-2'>{row.rate}</td>
                    <td className='px-3 py-2 text-center'>{row.totalTimeUsed}</td>
                    <td className='px-3 py-2 text-right'>
                      ₹
                      {row.credits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className='font-bold'>
                  <td className='rounded-bl-md'></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='px-3 py-2 text-right align-middle font-bold rounded-br-md'>
                    Total&nbsp;&nbsp;&nbsp;₹
                    {k8sIPTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      return null;
    };

    return (
      <Card>
        <CardContent className='pt-6'>
          <VercelTabs
            tabs={kubernetesTabs}
            activeTab={kubernetesTab}
            onTabChange={setKubernetesTab}
            size='md'
            className='mb-4'
          />
          {renderTable()}
        </CardContent>
      </Card>
    );
  };

  // AI Solutions Section Component
  const SolutionsSection = () => {
    const solutionsTabs = [
      { id: 'bhashik', label: 'Bhashik' },
      { id: 'dis', label: 'DIS' },
      { id: 'industrial', label: 'Industrial Solution' },
    ];

    // Data for each tab (updated to match VPC structure)
    const bhashikData = [
      {
        service: 'Text to Speech',
        unit: 'Per 1M input character',
        unitsUsed: '10',
        rate: '₹266 Per 1M input character',
        credits: 2660.0,
      },
      {
        service: 'Text to Speech Translate',
        unit: 'Per 1M input character',
        unitsUsed: '10',
        rate: '₹1262 Per 1M input character',
        credits: 12620.0,
      },
      {
        service: 'Speech to text',
        unit: 'per hour of input audio',
        unitsUsed: '10',
        rate: '₹24 per hour of input audio',
        credits: 240.0,
      },
      {
        service: 'Speech to text long form',
        unit: 'per hour of input audio',
        unitsUsed: '10',
        rate: '₹24 per hour of input audio',
        credits: 240.0,
      },
      {
        service: 'Speech to text translate',
        unit: 'per hour of input audio',
        unitsUsed: '10',
        rate: '₹24 per hour of input audio',
        credits: 240.0,
      },
      {
        service: 'Speech to text translate long form',
        unit: 'per hour of input audio',
        unitsUsed: '10',
        rate: '₹24 per hour of input audio',
        credits: 240.0,
      },
      {
        service: 'Speech to speech translate',
        unit: 'per hour of input audio',
        unitsUsed: '10',
        rate: '₹166 per hour of input audio',
        credits: 1660.0,
      },
    ];
    const bhashikTotal = 17900.0;

    const disData = [
      {
        service: 'DocIntelligenceText Extraction- document',
        unit: 'per 1000 pages',
        unitsUsed: '10',
        rate: '₹100 per 1000 pages',
        credits: 1000.0,
      },
      {
        service: 'DocIntelligenceText extraction- OCR',
        unit: 'per 1000 pages',
        unitsUsed: '10',
        rate: '₹398 per 1000 pages',
        credits: 3980.0,
      },
      {
        service: 'DocIntelligenceExtract information- document',
        unit: 'per 1000 pages',
        unitsUsed: '10',
        rate: '₹1726 per 1000 pages',
        credits: 17260.0,
      },
      {
        service: 'DocIntelligenceExtract information- OCR',
        unit: 'per 1000 pages',
        unitsUsed: '10',
        rate: '₹1726 per 1000 pages',
        credits: 17260.0,
      },
      {
        service: 'DocIntelligenceDocument Summarisation- document',
        unit: 'per 1000 pages',
        unitsUsed: '10',
        rate: '₹166 per 1000 pages',
        credits: 1660.0,
      },
      {
        service: 'DocIntelligenceDocument Summarisation- OCR',
        unit: 'per 1000 pages',
        unitsUsed: '10',
        rate: '₹531 per 1000 pages',
        credits: 5310.0,
      },
      {
        service: 'DocIntelligencePII Masking- document',
        unit: 'per 1000 pages',
        unitsUsed: '10',
        rate: '₹232 per 1000 pages',
        credits: 2320.0,
      },
    ];
    const disTotal = 43810.0;

    const industrialData = [
      {
        notebookName: 'Test 1',
        podStorage: 'Pod',
        flavour: 'A100-NVLINK-Standard-1x',
        rate: '₹ 105 per hour',
        totalUsedUnit: '1',
        totalUsedTime: '10 hrs',
        credits: 1050.0,
      },
      {
        notebookName: 'Test 1',
        podStorage: 'Storage',
        flavour: 'Container Disk',
        rate: '₹ 0.006 Per GB Per Hour',
        totalUsedUnit: '10 GB',
        totalUsedTime: '10 hrs',
        credits: 0.6,
      },
      {
        notebookName: 'Test 1',
        podStorage: 'Storage',
        flavour: 'Volume Disk',
        rate: '₹ 0.006 Per GB Per Hour',
        totalUsedUnit: '10 GB',
        totalUsedTime: '12 hrs',
        credits: 0.72,
      },
    ];
    const industrialTotal = 1051.32;

    // Render table for each tab
    const renderTable = () => {
      if (showEmptyState) {
        if (solutionsTab === 'bhashik') {
          return (
            <EmptyState
              title='No Bhashik Usage Yet'
              description='Your speech-to-text, text-to-speech, and translation service usage will be tracked here once you start using Bhashik.'
              className='min-h-[300px]'
            />
          );
        }
        if (solutionsTab === 'dis') {
          return (
            <EmptyState
              title='No DIS Usage Yet'
              description='Your document intelligence, text extraction, and OCR service usage will be shown here once you start using DIS.'
              className='min-h-[300px]'
            />
          );
        }
        if (solutionsTab === 'industrial') {
          return (
            <EmptyState
              title='No Industrial Solution Usage Yet'
              description='Your industrial AI solutions, notebook usage, and pod storage costs will appear here once you start using our industrial services.'
              className='min-h-[300px]'
            />
          );
        }
      }

      if (solutionsTab === 'bhashik') {
        return (
          <div className='rounded-md border mt-4'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium rounded-tl-md'>
                    Service
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Unit
                  </th>
                  <th className='px-3 py-2 text-center text-muted-foreground font-medium'>
                    Units used
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Rate
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium rounded-tr-md'>
                    Total credits used
                  </th>
                </tr>
              </thead>
              <tbody>
                {bhashikData.map((row, idx) => (
                  <tr
                    key={idx}
                    className='border-b transition-colors hover:bg-gray-50/40'
                  >
                    <td className='px-3 py-2'>{row.service}</td>
                    <td className='px-3 py-2'>{row.unit}</td>
                    <td className='px-3 py-2 text-center'>{row.unitsUsed}</td>
                    <td className='px-3 py-2'>{row.rate}</td>
                    <td className='px-3 py-2 text-right'>
                      ₹
                      {row.credits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className='font-bold'>
                  <td className='rounded-bl-md'></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='px-3 py-2 text-right align-middle font-bold rounded-br-md'>
                    Total&nbsp;&nbsp;&nbsp;₹
                    {bhashikTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      if (solutionsTab === 'dis') {
        return (
          <div className='rounded-md border mt-4'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium rounded-tl-md'>
                    Service
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Unit
                  </th>
                  <th className='px-3 py-2 text-center text-muted-foreground font-medium'>
                    Units used
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Rate
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium rounded-tr-md'>
                    Total credits used
                  </th>
                </tr>
              </thead>
              <tbody>
                {disData.map((row, idx) => (
                  <tr
                    key={idx}
                    className='border-b transition-colors hover:bg-gray-50/40'
                  >
                    <td className='px-3 py-2'>{row.service}</td>
                    <td className='px-3 py-2'>{row.unit}</td>
                    <td className='px-3 py-2 text-center'>{row.unitsUsed}</td>
                    <td className='px-3 py-2'>{row.rate}</td>
                    <td className='px-3 py-2 text-right'>
                      ₹
                      {row.credits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className='font-bold'>
                  <td className='rounded-bl-md'></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='px-3 py-2 text-right align-middle font-bold rounded-br-md'>
                    Total&nbsp;&nbsp;&nbsp;₹
                    {disTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      if (solutionsTab === 'industrial') {
        return (
          <div className='rounded-md border mt-4'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium rounded-tl-md'>
                    Notebook name
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Pod/Storage
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Flavour
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Rate
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Total used unit
                  </th>
                  <th className='px-3 py-2 text-left text-muted-foreground font-medium'>
                    Total used time
                  </th>
                  <th className='px-3 py-2 text-right text-muted-foreground font-medium rounded-tr-md'>
                    Total credits used
                  </th>
                </tr>
              </thead>
              <tbody>
                {industrialData.map((row, idx) => (
                  <tr
                    key={idx}
                    className='border-b transition-colors hover:bg-gray-50/40'
                  >
                    <td className='px-3 py-2'>{row.notebookName}</td>
                    <td className='px-3 py-2'>{row.podStorage}</td>
                    <td className='px-3 py-2'>{row.flavour}</td>
                    <td className='px-3 py-2'>{row.rate}</td>
                    <td className='px-3 py-2'>{row.totalUsedUnit}</td>
                    <td className='px-3 py-2'>{row.totalUsedTime}</td>
                    <td className='px-3 py-2 text-right'>
                      ₹
                      {row.credits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className='font-bold'>
                  <td className='rounded-bl-md'></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='px-3 py-2 text-right align-middle font-bold rounded-br-md'>
                    Total&nbsp;&nbsp;&nbsp;₹
                    {industrialTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      return null;
    };

    return (
      <Card>
        <CardContent className='pt-6'>
          <VercelTabs
            tabs={solutionsTabs}
            activeTab={solutionsTab}
            onTabChange={setSolutionsTab}
            size='md'
            className='mb-4'
          />
          {renderTable()}
        </CardContent>
      </Card>
    );
  };

  // Header actions for billing
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isDateSelecting, setIsDateSelecting] = useState(false);

  const datePresets = [
    {
      label: 'Last 7 days',
      range: {
        from: new Date(new Date().setDate(new Date().getDate() - 7)),
        to: new Date(),
      },
    },
    {
      label: 'Last 30 days',
      range: {
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
      },
    },
    {
      label: 'Last 3 months',
      range: {
        from: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        to: new Date(),
      },
    },
    {
      label: 'This month',
      range: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
      },
    },
  ];

  const handleHeaderPresetSelect = (preset: (typeof datePresets)[0]) => {
    setDate(preset.range);
    setIsDatePickerOpen(false);
    setIsDateSelecting(false);
  };

  const handleHeaderDateSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    if (selectedDate?.from && selectedDate?.to) {
      setIsDateSelecting(false);
    } else if (selectedDate?.from && !selectedDate?.to) {
      setIsDateSelecting(true);
    } else {
      setIsDateSelecting(false);
    }
  };

  const headerActions = (
    <>
      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className='flex items-center gap-2 min-w-[260px] justify-start text-left font-normal'
          >
            <CalendarIcon className='h-4 w-4' />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                <span className='text-blue-600'>
                  From: {format(date.from, 'LLL dd, y')} | Select end
                </span>
              )
            ) : (
              'Pick a date range'
            )}
            <ChevronDownIcon className='h-4 w-4' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0 flex' align='end'>
          {/* Quick Presets Sidebar */}
          <div className='w-48 p-3 border-r bg-gray-50'>
            <h4 className='font-medium text-sm mb-3 text-gray-700'>
              Quick Select
            </h4>
            <div className='space-y-1'>
              {datePresets.map(preset => (
                <Button
                  key={preset.label}
                  variant='ghost'
                  size='sm'
                  className='w-full justify-start h-8 text-sm'
                  onClick={() => handleHeaderPresetSelect(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Current Selection Status */}
            {date?.from && (
              <div className='mt-4 pt-3 border-t'>
                <h5 className='font-medium text-xs text-gray-600 mb-2'>
                  Current Selection
                </h5>
                <div className='text-xs text-gray-500 space-y-1'>
                  <div>Start: {format(date.from, 'MMM dd, y')}</div>
                  {date.to ? (
                    <div>End: {format(date.to, 'MMM dd, y')}</div>
                  ) : (
                    <div className='text-blue-600'>Select end date →</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Calendar Section */}
          <div className='p-3'>
            {/* Selection Progress Indicator */}
            {isDateSelecting && date?.from && (
              <div className='mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700'>
                <span className='font-medium'>Start:</span>{' '}
                {format(date.from, 'LLL dd, y')}
                <br />
                <span className='text-blue-600'>Now select an end date</span>
              </div>
            )}

            <Calendar
              initialFocus
              mode='range'
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleHeaderDateSelect}
              numberOfMonths={2}
              className='rounded-md'
              modifiers={{
                ...(date?.from && { start: date.from }),
                ...(date?.to && { end: date.to }),
              }}
              modifiersStyles={{
                start: {
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontWeight: 'bold',
                },
                end: {
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontWeight: 'bold',
                },
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
      <Link href='/billing/add-credits'>
        <Button variant='default'>Add Credits</Button>
      </Link>
    </>
  );

  return (
    <PageLayout
      title='Usage Metrics'
      description='Track resource usage and billing information'
      headerActions={headerActions}
    >
      <div className='space-y-6'>
        <VercelTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          size='lg'
        />

        {activeTab === 'summary' && <SummarySection />}
        {activeTab === 'core' && <CoreInfrastructureSection />}
        {activeTab === 'studio' && <StudioSection />}
        {activeTab === 'solutions' && <SolutionsSection />}

        {/* Modal for resource details */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resource Details</DialogTitle>
            </DialogHeader>
            <div className='py-4'>
              {modalResource ? (
                <div className='space-y-2'>
                  <div>
                    <span className='font-semibold'>Name:</span>{' '}
                    {modalResource.name}
                  </div>
                  {modalResource.type && (
                    <div>
                      <span className='font-semibold'>Type:</span>{' '}
                      {modalResource.type}
                    </div>
                  )}
                  {modalResource.status && (
                    <div>
                      <span className='font-semibold'>Status:</span>{' '}
                      {modalResource.status}
                    </div>
                  )}
                  <div>
                    <span className='font-semibold'>Credits Used:</span>{' '}
                    {modalResource.credits}
                  </div>
                </div>
              ) : null}
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cluster Details Drawer */}
        <Sheet open={clusterDrawerOpen} onOpenChange={setClusterDrawerOpen}>
          <SheetContent className='w-full sm:max-w-4xl overflow-y-auto'>
            {selectedCluster && (
              <div className='space-y-6'>
                {/* Header Section */}
                <div>
                  <SheetHeader>
                    <SheetTitle className='text-2xl font-semibold'>
                      {selectedCluster.clusterName}
                    </SheetTitle>
                  </SheetHeader>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground mt-2'>
                    <span>{selectedCluster.region}</span>
                    <span>•</span>
                    <span>v{selectedCluster.version}</span>
                    <span>•</span>
                    <span>{selectedCluster.rate}</span>
                  </div>
                </div>

                {/* Summary Card */}
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
                  <div className='grid grid-cols-3 gap-6'>
                    {/* Cluster Credits */}
                    <div className='text-center'>
                      <div className='text-base text-muted-foreground mb-2'>
                        Cluster Credits
                      </div>
                      <div className='text-lg font-bold text-black'>
                        ₹{selectedCluster.credits.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    {/* Resources Credits */}
                    <div className='text-center'>
                      <div className='text-base text-muted-foreground mb-2'>
                        Resources Credits
                      </div>
                      <div className='text-lg font-bold text-black'>
                        ₹{(() => {
                          const clusterNodePools = filteredMockNodePools.filter(
                            (np: any) => np.clusterName === selectedCluster.clusterName
                          );
                          const clusterVolumes = filteredMockK8sVolumes.filter(
                            (v: any) => v.clusterName === selectedCluster.clusterName
                          );
                          const clusterLBs = filteredMockLoadBalancers.filter(
                            (lb: any) => lb.clusterName === selectedCluster.clusterName
                          );
                          const clusterIPs = filteredMockK8sIP.filter(
                            (ip: any) => ip.clusterName === selectedCluster.clusterName
                          );
                          const resourceTotal =
                            clusterNodePools.reduce((sum: number, item: any) => sum + item.credits, 0) +
                            clusterVolumes.reduce((sum: number, item: any) => sum + item.credits, 0) +
                            clusterLBs.reduce((sum: number, item: any) => sum + item.credits, 0) +
                            clusterIPs.reduce((sum: number, item: any) => sum + item.credits, 0);
                          return resourceTotal.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          });
                        })()}
                      </div>
                    </div>

                    {/* Total Credits */}
                    <div className='text-center'>
                      <div className='text-base text-muted-foreground mb-2'>
                        Total Credits
                      </div>
                      <div className='text-lg font-bold text-black mb-2'>
                        ₹{(() => {
                          const clusterNodePools = filteredMockNodePools.filter(
                            (np: any) => np.clusterName === selectedCluster.clusterName
                          );
                          const clusterVolumes = filteredMockK8sVolumes.filter(
                            (v: any) => v.clusterName === selectedCluster.clusterName
                          );
                          const clusterLBs = filteredMockLoadBalancers.filter(
                            (lb: any) => lb.clusterName === selectedCluster.clusterName
                          );
                          const clusterIPs = filteredMockK8sIP.filter(
                            (ip: any) => ip.clusterName === selectedCluster.clusterName
                          );
                          const resourceTotal =
                            clusterNodePools.reduce((sum: number, item: any) => sum + item.credits, 0) +
                            clusterVolumes.reduce((sum: number, item: any) => sum + item.credits, 0) +
                            clusterLBs.reduce((sum: number, item: any) => sum + item.credits, 0) +
                            clusterIPs.reduce((sum: number, item: any) => sum + item.credits, 0);
                          return (selectedCluster.credits + resourceTotal).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          });
                        })()}
                      </div>
                      <div className='text-xs text-black bg-green-100 rounded-full px-3 py-1 inline-block'>
                        Combined Total
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resource Details Accordion */}
                <Accordion type='multiple' defaultValue={['nodePools', 'volumes', 'loadBalancers', 'ipAddresses']} className='space-y-2'>
                  {/* Node Pools Section */}
                  {filteredMockNodePools.filter(
                    (np: any) => np.clusterName === selectedCluster.clusterName
                  ).length > 0 && (
                    <AccordionItem value='nodePools' className='border rounded-lg'>
                      <AccordionTrigger className='px-4 hover:no-underline'>
                        <div className='flex items-center justify-between w-full pr-4'>
                          <span className='font-semibold'>Node Pools</span>
                          <span className='text-sm text-muted-foreground'>
                            {filteredMockNodePools.filter(
                              (np: any) => np.clusterName === selectedCluster.clusterName
                            ).length}{' '}
                            total • ₹
                            {filteredMockNodePools
                              .filter((np: any) => np.clusterName === selectedCluster.clusterName)
                              .reduce((sum: number, item: any) => sum + item.credits, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className='px-4 pb-4'>
                        <div className='rounded-md border mt-2'>
                          <table className='min-w-full text-sm table-fixed'>
                            <thead>
                              <tr className='bg-muted'>
                                <th className='px-3 py-2 text-left text-muted-foreground font-medium w-[40px]'></th>
                                <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/6'>Name</th>
                                <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/6'>Flavour</th>
                                <th className='px-3 py-2 text-center text-muted-foreground font-medium w-1/6'>VM Count</th>
                                <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/6'>Rate</th>
                                <th className='px-3 py-2 text-center text-muted-foreground font-medium w-1/6'>Time Used</th>
                                <th className='px-3 py-2 text-right text-muted-foreground font-medium w-1/6'>Credits</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredMockNodePools
                                .filter((np: any) => np.clusterName === selectedCluster.clusterName)
                                .map((nodePool: any, idx: number) => (
                                  <NodePoolRow key={idx} nodePool={nodePool} index={idx} />
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Volumes Section */}
                  {filteredMockK8sVolumes.filter(
                    (v: any) => v.clusterName === selectedCluster.clusterName
                  ).length > 0 && (
                    <AccordionItem value='volumes' className='border rounded-lg'>
                      <AccordionTrigger className='px-4 hover:no-underline'>
                        <div className='flex items-center justify-between w-full pr-4'>
                          <span className='font-semibold'>Volumes</span>
                          <span className='text-sm text-muted-foreground'>
                            {filteredMockK8sVolumes.filter(
                              (v: any) => v.clusterName === selectedCluster.clusterName
                            ).length}{' '}
                            total • ₹
                            {filteredMockK8sVolumes
                              .filter((v: any) => v.clusterName === selectedCluster.clusterName)
                              .reduce((sum: number, item: any) => sum + item.credits, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className='px-4 pb-4'>
                        <div className='rounded-md border mt-2'>
                          <table className='min-w-full text-sm table-fixed'>
                            <thead>
                              <tr className='bg-muted'>
                                <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/6'>Name</th>
                                <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/6'>Type</th>
                                <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/6'>Size</th>
                                <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/6'>Rate</th>
                                <th className='px-3 py-2 text-center text-muted-foreground font-medium w-1/6'>Time Used</th>
                                <th className='px-3 py-2 text-right text-muted-foreground font-medium w-1/6'>Credits</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredMockK8sVolumes
                                .filter((v: any) => v.clusterName === selectedCluster.clusterName)
                                .map((volume: any, idx: number) => (
                                  <tr key={idx} className='border-b transition-colors hover:bg-gray-50/40'>
                                    <td className='px-3 py-2'>{volume.volumeName}</td>
                                    <td className='px-3 py-2'>{volume.storageType}</td>
                                    <td className='px-3 py-2'>{volume.averageSize}</td>
                                    <td className='px-3 py-2'>{volume.rate}</td>
                                    <td className='px-3 py-2 text-center'>{volume.totalTimeUsed}</td>
                                    <td className='px-3 py-2 text-right font-semibold'>₹{volume.credits.toLocaleString()}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Load Balancers Section */}
                  {filteredMockLoadBalancers.filter(
                    (lb: any) => lb.clusterName === selectedCluster.clusterName
                  ).length > 0 && (
                    <AccordionItem value='loadBalancers' className='border rounded-lg'>
                      <AccordionTrigger className='px-4 hover:no-underline'>
                        <div className='flex items-center justify-between w-full pr-4'>
                          <span className='font-semibold'>Load Balancers</span>
                          <span className='text-sm text-muted-foreground'>
                            {filteredMockLoadBalancers.filter(
                              (lb: any) => lb.clusterName === selectedCluster.clusterName
                            ).length}{' '}
                            total • ₹
                            {filteredMockLoadBalancers
                              .filter((lb: any) => lb.clusterName === selectedCluster.clusterName)
                              .reduce((sum: number, item: any) => sum + item.credits, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className='px-4 pb-4'>
                        <div className='rounded-md border mt-2'>
                          <table className='min-w-full text-sm table-fixed'>
                            <thead>
                              <tr className='bg-muted'>
                                <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/6'>Name</th>
                                <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/6'>Type</th>
                                <th className='px-3 py-2 text-right text-muted-foreground font-medium w-1/6'>Base Charge</th>
                                <th className='px-3 py-2 text-center text-muted-foreground font-medium w-1/6'>Data Processed</th>
                                <th className='px-3 py-2 text-right text-muted-foreground font-medium w-1/6'>Data Rate</th>
                                <th className='px-3 py-2 text-right text-muted-foreground font-medium w-1/6'>Credits</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredMockLoadBalancers
                                .filter((lb: any) => lb.clusterName === selectedCluster.clusterName)
                                .map((loadBalancer: any, idx: number) => (
                                  <tr key={idx} className='border-b transition-colors hover:bg-gray-50/40'>
                                    <td className='px-3 py-2'>{loadBalancer.lbName}</td>
                                    <td className='px-3 py-2'>{loadBalancer.lbType}</td>
                                    <td className='px-3 py-2 text-right'>{loadBalancer.baseCharge}</td>
                                    <td className='px-3 py-2 text-center'>{loadBalancer.totalDataProcessed}</td>
                                    <td className='px-3 py-2 text-right'>{loadBalancer.dataProcessingCharges}</td>
                                    <td className='px-3 py-2 text-right font-semibold'>₹{loadBalancer.credits.toLocaleString()}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* IP Addresses Section */}
                  {filteredMockK8sIP.filter(
                    (ip: any) => ip.clusterName === selectedCluster.clusterName
                  ).length > 0 && (
                    <AccordionItem value='ipAddresses' className='border rounded-lg'>
                      <AccordionTrigger className='px-4 hover:no-underline'>
                        <div className='flex items-center justify-between w-full pr-4'>
                          <span className='font-semibold'>IP Addresses</span>
                          <span className='text-sm text-muted-foreground'>
                            {filteredMockK8sIP.filter(
                              (ip: any) => ip.clusterName === selectedCluster.clusterName
                            ).length}{' '}
                            total • ₹
                            {filteredMockK8sIP
                              .filter((ip: any) => ip.clusterName === selectedCluster.clusterName)
                              .reduce((sum: number, item: any) => sum + item.credits, 0)
                              .toFixed(2)}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className='px-4 pb-4'>
                        <div className='rounded-md border mt-2'>
                          <table className='min-w-full text-sm table-fixed'>
                            <thead>
                              <tr className='bg-muted'>
                                <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/4'>IP Address</th>
                                <th className='px-3 py-2 text-left text-muted-foreground font-medium w-1/4'>Rate</th>
                                <th className='px-3 py-2 text-center text-muted-foreground font-medium w-1/4'>Time Used</th>
                                <th className='px-3 py-2 text-right text-muted-foreground font-medium w-1/4'>Credits</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredMockK8sIP
                                .filter((ip: any) => ip.clusterName === selectedCluster.clusterName)
                                .map((ipAddress: any, idx: number) => (
                                  <tr key={idx} className='border-b transition-colors hover:bg-gray-50/40'>
                                    <td className='px-3 py-2'>{ipAddress.ipAddress}</td>
                                    <td className='px-3 py-2'>{ipAddress.rate}</td>
                                    <td className='px-3 py-2 text-center'>{ipAddress.totalTimeUsed}</td>
                                    <td className='px-3 py-2 text-right font-semibold'>
                                      ₹{ipAddress.credits.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </PageLayout>
  );
}
