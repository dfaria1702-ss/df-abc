'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailGrid } from '@/components/detail-grid';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VercelTabs } from '@/components/ui/vercel-tabs';
import { Badge } from '@/components/ui/badge';
import { ShadcnDataTable } from '@/components/ui/shadcn-data-table';
import { ActionMenu } from '@/components/action-menu';
import { StatusBadge } from '@/components/status-badge';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { EmptyState } from '@/components/ui/empty-state';
import { getEmptyStateMessage } from '@/lib/demo-data-filter';
import { vpcs } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Info, CheckCircle, HelpCircle, Trash2 } from 'lucide-react';
import { DeleteDnsRecordModal } from '@/components/modals/delete-dns-record-modal';
import { useToast } from '@/hooks/use-toast';

// DNS Records illustration
const dnsRecordsIcon = (
  <svg
    width='215'
    height='140'
    viewBox='0 0 215 140'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <rect width='215' height='140' fill='#FFFFFF' />

    {/* Grid background */}
    <path
      d='M64 0L64 140'
      stroke='#EEEFF1'
      strokeWidth='0.8'
      strokeMiterlimit='10'
      strokeDasharray='3 3'
    />
    <path
      d='M151 0L151 140'
      stroke='#EEEFF1'
      strokeWidth='0.8'
      strokeMiterlimit='10'
      strokeDasharray='3 3'
    />
    <path
      d='M215 32H0'
      stroke='#EEEFF1'
      strokeWidth='0.8'
      strokeMiterlimit='10'
      strokeDasharray='3 3'
    />
    <path
      d='M215 108H0'
      stroke='#EEEFF1'
      strokeWidth='0.8'
      strokeMiterlimit='10'
      strokeDasharray='3 3'
    />
    <path
      d='M215 71H0'
      stroke='#EEEFF1'
      strokeWidth='0.8'
      strokeMiterlimit='10'
      strokeDasharray='3 3'
    />

    {/* DNS server illustration */}
    <rect
      x='85'
      y='45'
      width='45'
      height='50'
      rx='4'
      fill='#F8F9FF'
      stroke='#E1E5F5'
      strokeWidth='1.5'
    />
    <rect x='90' y='50' width='35' height='6' rx='2' fill='#4F46E5' />
    <rect x='90' y='60' width='25' height='3' rx='1.5' fill='#CBD5E1' />
    <rect x='90' y='67' width='30' height='3' rx='1.5' fill='#CBD5E1' />
    <rect x='90' y='74' width='20' height='3' rx='1.5' fill='#CBD5E1' />
    <rect x='90' y='81' width='35' height='3' rx='1.5' fill='#10B981' />
    <rect x='90' y='88' width='15' height='3' rx='1.5' fill='#CBD5E1' />

    {/* DNS connection lines */}
    <path
      d='M70 70 Q 45 65 30 70'
      stroke='#10B981'
      strokeWidth='2'
      fill='none'
      strokeDasharray='4 4'
    />
    <path
      d='M145 70 Q 170 65 185 70'
      stroke='#10B981'
      strokeWidth='2'
      fill='none'
      strokeDasharray='4 4'
    />

    {/* Domain/Globe icons */}
    <circle
      cx='25'
      cy='70'
      r='12'
      fill='#F0F9FF'
      stroke='#0EA5E9'
      strokeWidth='1.5'
    />
    <path d='M20 65 Q 25 62 30 65 Q 25 68 20 65Z' fill='#0EA5E9' />
    <path d='M20 75 Q 25 78 30 75 Q 25 72 20 75Z' fill='#0EA5E9' />
    <path d='M25 58V82' stroke='#0EA5E9' strokeWidth='1' />
    <path d='M13 70H37' stroke='#0EA5E9' strokeWidth='1' />

    <circle
      cx='190'
      cy='70'
      r='12'
      fill='#F0FDF4'
      stroke='#10B981'
      strokeWidth='1.5'
    />
    <path d='M185 65 Q 190 62 195 65 Q 190 68 185 65Z' fill='#10B981' />
    <path d='M185 75 Q 190 78 195 75 Q 190 72 185 75Z' fill='#10B981' />
    <path d='M190 58V82' stroke='#10B981' strokeWidth='1' />
    <path d='M178 70H202' stroke='#10B981' strokeWidth='1' />

    {/* Record type indicators */}
    <rect x='95' y='35' width='8' height='8' rx='1' fill='#10B981' />
    <text x='97' y='41' fontSize='6' fill='white' fontWeight='bold'>
      A
    </text>
    <rect x='107' y='35' width='12' height='8' rx='1' fill='#6366F1' />
    <text x='109' y='41' fontSize='5' fill='white' fontWeight='bold'>
      CNAME
    </text>
    <rect x='123' y='35' width='8' height='8' rx='1' fill='#F59E0B' />
    <text x='125' y='41' fontSize='6' fill='white' fontWeight='bold'>
      MX
    </text>
  </svg>
);

// Mock hosted zone data (in real app, fetch from API based on ID)
const hostedZoneData = {
  id: 'hz-1',
  domainName: 'example.com',
  type: 'Private',
  status: 'success',
  recordCount: 8,
  createdOn: '2023-10-15T10:00:00Z',
};

// Mock DNS records data
const mockDnsRecords = [
  {
    id: 'record-1',
    recordName: 'www',
    type: 'A',
    value: '192.168.1.1',
    routingProtocol: 'Simple',
    ttl: 300,
    status: 'active',
  },
  {
    id: 'record-2',
    recordName: '@',
    type: 'A',
    value: '192.168.1.1',
    routingProtocol: 'Simple',
    ttl: 300,
    status: 'active',
  },
  {
    id: 'record-3',
    recordName: 'mail',
    type: 'MX',
    value: '10 mail.example123.com',
    routingProtocol: 'Simple',
    ttl: 3600,
    status: 'active',
  },
  {
    id: 'record-4',
    recordName: '@',
    type: 'NS',
    value: 'ns1.example.com',
    routingProtocol: 'Simple',
    ttl: 86400,
    status: 'active',
  },
];

const TTL_OPTIONS = [
  { value: '300', label: '5 mins' },
  { value: '5', label: '5 secs' },
  { value: '60', label: '1 min' },
  { value: '1800', label: '30 mins' },
  { value: '3600', label: '60 mins' },
  { value: '86400', label: '24 hours' },
];

const ROUTING_PROTOCOLS = [
  {
    value: 'Simple',
    label: 'Simple',
    description: 'Directly maps your domain to one or more IPs.',
  },
  {
    value: 'Weighted',
    label: 'Weighted',
    description:
      'Distributes traffic across multiple IPs based on weights you set. Use when you have multiple resources and want to control what percentage of traffic goes to each.',
  },
  {
    value: 'GeoIP',
    label: 'GeoIP',
    description:
      'Route users to different IPs based on their country or region. Useful for serving content closer to your users.',
  },
  {
    value: 'HealthPort',
    label: 'HealthPort',
    description:
      'Checks if servers are healthy on a specific port before routing traffic. Supports automatic failover to backup servers.',
  },
  {
    value: 'HealthURL',
    label: 'HealthURL',
    description:
      'Monitors the availability of your servers via an HTTP/HTTPS URL. Routes traffic only to healthy IPs.',
  },
];

const COUNTRY_CODES = [
  { value: 'US', label: 'United States (US)' },
  { value: 'CA', label: 'Canada (CA)' },
  { value: 'GB', label: 'United Kingdom (GB)' },
  { value: 'DE', label: 'Germany (DE)' },
  { value: 'FR', label: 'France (FR)' },
  { value: 'JP', label: 'Japan (JP)' },
  { value: 'AU', label: 'Australia (AU)' },
  { value: 'IN', label: 'India (IN)' },
  { value: 'BR', label: 'Brazil (BR)' },
  { value: 'CN', label: 'China (CN)' },
  { value: 'RU', label: 'Russia (RU)' },
  { value: 'IT', label: 'Italy (IT)' },
  { value: 'ES', label: 'Spain (ES)' },
  { value: 'NL', label: 'Netherlands (NL)' },
  { value: 'SE', label: 'Sweden (SE)' },
  { value: 'NO', label: 'Norway (NO)' },
  { value: 'DK', label: 'Denmark (DK)' },
  { value: 'FI', label: 'Finland (FI)' },
  { value: 'BE', label: 'Belgium (BE)' },
  { value: 'CH', label: 'Switzerland (CH)' },
];

export default function ManageHostedZonePage({
  params,
}: {
  params: { id: string };
}) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewlyCreated = searchParams?.get('created') === 'true';

  const [showSkipMessage, setShowSkipMessage] = useState(isNewlyCreated);
  const [activeRecordTab, setActiveRecordTab] = useState('A');
  const [dnsRecords, setDnsRecords] = useState(mockDnsRecords);
  const [recordValues, setRecordValues] = useState<string[]>(['']);
  const [weightedValues, setWeightedValues] = useState<
    Array<{ value: string; weight: string }>
  >([{ value: '', weight: '' }]);
  const [geoipRecords, setGeoipRecords] = useState([
    { type: 'Default', value: '', countryCode: '', canDelete: false },
    { type: 'Country Code', value: '', countryCode: '', canDelete: true },
  ]);
  const [healthPortData, setHealthPortData] = useState({
    port: '80',
    primaryIPs: '',
    secondaryIPs: '',
  });
  const [healthURLData, setHealthURLData] = useState({
    url: '',
    ipv4Addresses: '',
  });
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isDeleteRecordModalOpen, setIsDeleteRecordModalOpen] = useState(false);
  const [isEditRecordModalOpen, setIsEditRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    recordName: '',
    ttl: '300',
    routingProtocol: 'Simple',
    value: '',
  });
  // Edit-specific dynamic states to mirror Add New DNS Record UI
  const [editRecordValues, setEditRecordValues] = useState<string[]>(['']);
  const [editWeightedValues, setEditWeightedValues] = useState<
    Array<{ value: string; weight: string }>
  >([{ value: '', weight: '' }]);
  const [editGeoipRecords, setEditGeoipRecords] = useState(
    [
      { type: 'Default', value: '', countryCode: '', canDelete: false },
      { type: 'Country Code', value: '', countryCode: '', canDelete: true },
    ]
  );
  const [editHealthPortData, setEditHealthPortData] = useState({
    port: '80',
    primaryIPs: '',
    secondaryIPs: '',
  });
  const [editHealthURLData, setEditHealthURLData] = useState({
    url: '',
    ipv4Addresses: '',
  });
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [selectedAttachVpc, setSelectedAttachVpc] = useState<string>('');

  // Associated VPCs mock association for this hosted zone
  const [associatedVpcIds, setAssociatedVpcIds] = useState<string[]>([
    'vpc-1',
    'vpc-2',
    'vpc-3',
  ]);
  const associatedVpcs = useMemo(
    () => vpcs.filter(v => associatedVpcIds.includes(v.id)),
    [associatedVpcIds]
  );

  const handleDetachVpc = (vpc: any) => {
    setAssociatedVpcIds(prev => prev.filter(id => id !== vpc.id));
    toast({
      title: 'VPC detached',
      description: `${vpc.name} has been detached from this hosted zone`,
    });
  };

  const availableVpcsToAttach = useMemo(
    () => vpcs.filter(v => !associatedVpcIds.includes(v.id)),
    [associatedVpcIds]
  );

  const handleConfirmAttachVpc = () => {
    if (!selectedAttachVpc) return;
    setAssociatedVpcIds(prev => [...prev, selectedAttachVpc]);
    const v = vpcs.find(x => x.id === selectedAttachVpc);
    toast({
      title: 'VPC attached',
      description: `${v?.name || selectedAttachVpc} has been attached to this hosted zone`,
    });
    setSelectedAttachVpc('');
    setIsAttachModalOpen(false);
  };

  const vpcColumns = [
    {
      key: 'name',
      label: 'VPC Name',
      sortable: true,
      searchable: true,
      width: '25%',
      render: (value: string) => (
        <div className='font-medium'>{value}</div>
      ),
    },
    {
      key: 'region',
      label: 'Region',
      sortable: true,
      searchable: true,
      width: '25%',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '25%',
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right' as const,
      width: '25%',
      render: (_: any, row: any) => (
        <div className='flex justify-end'>
          <ActionMenu
            resourceName={row.name}
            resourceType='VPC'
            customActions={[
              {
                label: 'Detach',
                variant: 'destructive',
                icon: <Trash2 className='mr-2 h-4 w-4' />,
                onClick: () => handleDetachVpc(row),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  // Form state for adding DNS records
  const [recordForm, setRecordForm] = useState({
    recordName: '',
    ttl: '300',
    routingProtocol: 'Simple',
    value: '',
  });

  const handleAddRecord = () => {
    const newRecord = {
      id: `record-${Date.now()}`,
      recordName: recordForm.recordName,
      type: activeRecordTab,
      value: recordForm.value,
      routingProtocol: recordForm.routingProtocol,
      ttl: parseInt(recordForm.ttl),
      status: 'active',
    };

    setDnsRecords(prev => [...prev, newRecord]);

    // Reset form
    setRecordForm({
      recordName: '',
      ttl: '300',
      routingProtocol: 'Simple',
      value: '',
    });
    setRecordValues(['']);
    setWeightedValues([{ value: '', weight: '' }]);
  };

  const handleDeleteRecordClick = (record: any) => {
    setSelectedRecord(record);
    setIsDeleteRecordModalOpen(true);
  };

  const handleDeleteRecordConfirm = async () => {
    if (selectedRecord) {
      // Simulate delete API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('DNS record deleted:', selectedRecord.recordName);

      // Remove from records list
      setDnsRecords(prev =>
        prev.filter(record => record.id !== selectedRecord.id)
      );

      // Close modal and reset state
      setIsDeleteRecordModalOpen(false);
      setSelectedRecord(null);
    }
  };

  const handleDeleteRecordCancel = () => {
    setIsDeleteRecordModalOpen(false);
    setSelectedRecord(null);
  };

  const handleEditRecordClick = (record: any) => {
    setEditingRecord(record);
    setEditForm({
      recordName: record.recordName,
      ttl: record.ttl.toString(),
      routingProtocol: record.routingProtocol,
      value: record.value,
    });
    // Seed edit dynamic states from record
    const seededValues = (record.value || '')
      .split(',')
      .map((v: string) => v.trim())
      .filter(Boolean);
    setEditRecordValues(seededValues.length ? seededValues : ['']);
    setEditWeightedValues(
      seededValues.length
        ? seededValues.map((v: string) => ({ value: v, weight: '' }))
        : [{ value: '', weight: '' }]
    );
    setEditGeoipRecords([
      { type: 'Default', value: seededValues[0] || '', countryCode: '', canDelete: false },
      { type: 'Country Code', value: seededValues[1] || '', countryCode: '', canDelete: true },
    ]);
    setEditHealthPortData({ port: '80', primaryIPs: '', secondaryIPs: '' });
    setEditHealthURLData({ url: '', ipv4Addresses: '' });
    setIsEditRecordModalOpen(true);
  };

  const handleEditRecordSave = () => {
    if (editingRecord) {
      // Compute value from edit dynamic states based on routing protocol
      let computedValue = editForm.value;
      switch (editForm.routingProtocol) {
        case 'GeoIP':
          computedValue = editGeoipRecords
            .map((r: any) => r.value)
            .filter((v: string) => v && v.trim())
            .join(', ');
          break;
        case 'Weighted':
          computedValue = editWeightedValues
            .filter(w => w.value.trim())
            .map(w => (w.weight.trim() ? `${w.value}|${w.weight}` : w.value))
            .join(', ');
          break;
        case 'HealthPort':
          computedValue = `${editHealthPortData.port}|${editHealthPortData.primaryIPs}|${editHealthPortData.secondaryIPs}`;
          break;
        case 'HealthURL':
          computedValue = `${editHealthURLData.url}|${editHealthURLData.ipv4Addresses}`;
          break;
        default:
          computedValue = editRecordValues.filter(v => v.trim()).join(', ');
      }
      setDnsRecords(prev =>
        prev.map(record =>
          record.id === editingRecord.id
            ? {
                ...record,
                recordName: editForm.recordName,
                ttl: parseInt(editForm.ttl),
                routingProtocol: editForm.routingProtocol,
                value: computedValue,
              }
            : record
        )
      );

      setIsEditRecordModalOpen(false);
      setEditingRecord(null);
      setEditForm({
        recordName: '',
        ttl: '300',
        routingProtocol: 'Simple',
        value: '',
      });
    }
  };

  const handleEditRecordCancel = () => {
    setIsEditRecordModalOpen(false);
    setEditingRecord(null);
    setEditForm({
      recordName: '',
      ttl: '300',
      routingProtocol: 'Simple',
      value: '',
    });
    setEditRecordValues(['']);
    setEditWeightedValues([{ value: '', weight: '' }]);
    setEditGeoipRecords([
      { type: 'Default', value: '', countryCode: '', canDelete: false },
      { type: 'Country Code', value: '', countryCode: '', canDelete: true },
    ]);
    setEditHealthPortData({ port: '80', primaryIPs: '', secondaryIPs: '' });
    setEditHealthURLData({ url: '', ipv4Addresses: '' });
    setEditRecordValues(['']);
    setEditWeightedValues([{ value: '', weight: '' }]);
    setEditGeoipRecords([
      { type: 'Default', value: '', countryCode: '', canDelete: false },
      { type: 'Country Code', value: '', countryCode: '', canDelete: true },
    ]);
    setEditHealthPortData({ port: '80', primaryIPs: '', secondaryIPs: '' });
    setEditHealthURLData({ url: '', ipv4Addresses: '' });
  };

  // Edit helper updaters mirroring Add form behavior
  const updateEditRecordValue = (index: number, value: string) => {
    setEditRecordValues(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };
  const addEditRecordValue = () => setEditRecordValues(prev => [...prev, '']);
  const removeEditRecordValue = (index: number) =>
    setEditRecordValues(prev => prev.filter((_, i) => i !== index));

  const updateEditWeightedValue = (index: number, value: string) => {
    setEditWeightedValues(prev => {
      const next = [...prev];
      next[index] = { ...next[index], value };
      return next;
    });
  };
  const updateEditWeightedWeight = (index: number, weight: string) => {
    setEditWeightedValues(prev => {
      const next = [...prev];
      next[index] = { ...next[index], weight };
      return next;
    });
  };
  const addEditWeightedValue = () =>
    setEditWeightedValues(prev => [...prev, { value: '', weight: '' }]);
  const removeEditWeightedValue = (index: number) =>
    setEditWeightedValues(prev => prev.filter((_, i) => i !== index));

  const updateEditGeoipRecord = (index: number, value: string) => {
    setEditGeoipRecords(prev => {
      const next = [...prev];
      next[index] = { ...next[index], value } as any;
      return next;
    });
  };
  const updateEditGeoipCountryCode = (index: number, countryCode: string) => {
    setEditGeoipRecords(prev => {
      const next = [...prev];
      next[index] = { ...next[index], countryCode } as any;
      return next;
    });
  };
  const addEditGeoipRecord = () =>
    setEditGeoipRecords(prev => [
      ...prev,
      { type: 'Country Code', value: '', countryCode: '', canDelete: true },
    ]);
  const removeEditGeoipRecord = (index: number) =>
    setEditGeoipRecords(prev => prev.filter((_, i) => i !== index));

  const updateEditHealthPortData = (field: 'port' | 'primaryIPs' | 'secondaryIPs', value: string) =>
    setEditHealthPortData(prev => ({ ...prev, [field]: value }));
  const updateEditHealthURLData = (field: 'url' | 'ipv4Addresses', value: string) =>
    setEditHealthURLData(prev => ({ ...prev, [field]: value }));

  const addRecordValue = () => {
    setRecordValues(prev => [...prev, '']);
  };

  const removeRecordValue = (index: number) => {
    if (recordValues.length > 1) {
      setRecordValues(prev => {
        const newValues = prev.filter((_, i) => i !== index);
        setRecordForm(prevForm => ({
          ...prevForm,
          value: newValues.join(', '),
        }));
        return newValues;
      });
    }
  };

  const updateRecordValue = (index: number, value: string) => {
    setRecordValues(prev => {
      const newValues = [...prev];
      newValues[index] = value;
      return newValues;
    });
    setRecordForm(prev => ({ ...prev, value: recordValues.join(', ') }));
  };

  const addGeoipRecord = () => {
    setGeoipRecords(prev => [
      ...prev,
      { type: 'Country Code', value: '', countryCode: '', canDelete: true },
    ]);
  };

  const removeGeoipRecord = (index: number) => {
    if (geoipRecords[index].canDelete) {
      setGeoipRecords(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateGeoipRecord = (index: number, newValue: string) => {
    setGeoipRecords(prev => {
      const newRecords = [...prev];
      newRecords[index] = { ...newRecords[index], value: newValue };
      return newRecords;
    });
  };

  const updateGeoipCountryCode = (index: number, newCountryCode: string) => {
    setGeoipRecords(prev => {
      const newRecords = [...prev];
      newRecords[index] = { ...newRecords[index], countryCode: newCountryCode };
      return newRecords;
    });
  };

  const addWeightedValue = () => {
    setWeightedValues(prev => [...prev, { value: '', weight: '' }]);
  };

  const removeWeightedValue = (index: number) => {
    if (weightedValues.length > 1) {
      setWeightedValues(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateWeightedValue = (index: number, newValue: string) => {
    setWeightedValues(prev => {
      const newValues = [...prev];
      newValues[index] = { ...newValues[index], value: newValue };
      return newValues;
    });
  };

  const updateWeightedWeight = (index: number, newWeight: string) => {
    setWeightedValues(prev => {
      const newValues = [...prev];
      newValues[index] = { ...newValues[index], weight: newWeight };
      return newValues;
    });
  };

  const updateHealthPortData = (
    field: keyof typeof healthPortData,
    value: string
  ) => {
    setHealthPortData(prev => ({ ...prev, [field]: value }));
  };

  const updateHealthURLData = (
    field: keyof typeof healthURLData,
    value: string
  ) => {
    setHealthURLData(prev => ({ ...prev, [field]: value }));
  };

  // DNS Records Table Columns
  const dnsColumns = [
    {
      key: 'recordName',
      label: 'Record Name',
      sortable: true,
      searchable: true,
      render: (value: string) => <span className='font-medium'>{value}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value: string) => (
        <Badge variant='secondary' className='font-mono'>
          {value}
        </Badge>
      ),
    },
    {
      key: 'value',
      label: 'Value',
      searchable: true,
      render: (value: string) => (
        <span
          className='font-mono text-sm text-muted-foreground truncate max-w-xs'
          title={value}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'routingProtocol',
      label: 'Routing Protocol',
      sortable: true,
      render: (value: string) => <span className='text-sm'>{value}</span>,
    },
    {
      key: 'ttl',
      label: 'TTL',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className='text-sm text-muted-foreground'>{value}s</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right' as const,
      render: (value: any, row: any) => (
        <div className='flex justify-end'>
          <ActionMenu
            onCustomDelete={() => handleDeleteRecordClick(row)}
            onEdit={() => handleEditRecordClick(row)}
            deleteLabel='Delete Record'
            resourceName={row.recordName}
            resourceType='DNS Record'
          />
        </div>
      ),
    },
  ];

  const getRecordTypeDescription = (type: string) => {
    switch (type) {
      case 'A':
        return 'Maps your domain name to an IPv4 address.';
      case 'AAAA':
        return 'Maps your domain name to an IPv6 address.';
      case 'CNAME':
        return 'Acts as an alias by mapping your domain name to another domain name.';
      case 'MX':
        return 'Directs where emails for your domain should be delivered.';
      case 'NS':
        return 'Defines the name servers that control DNS settings for your domain.';
      case 'TXT':
        return 'Can be used to attach textual data to a domain. Often used to prove domain ownership (for services like Google or AWS) or to set up email safety checks.';
      default:
        return '';
    }
  };

  const getRecordValuesDescription = (type: string) => {
    // Handle HealthPort routing protocol description
    if (recordForm.routingProtocol === 'HealthPort') {
      return 'Enter the port you want to run health checks for. Primary IPs are returned as long as atleast one of them is actively listening on the specified port. Secondary IPs are returned if all primary IPs are unhealthy.';
    }

    // Handle HealthURL routing protocol description
    if (recordForm.routingProtocol === 'HealthURL') {
      return 'Enter the URL you want to run health checks for.';
    }

    switch (type) {
      case 'A':
        return 'Enter the IPv4 addresses you want to direct traffic to and their weights.';
      case 'AAAA':
        return 'Enter the IPv6 addresses you want to direct traffic to and their weights.';
      case 'CNAME':
        return 'Add the domain names you want to create an alias for.';
      case 'MX':
        return 'Add the priority and the mail exchanger host you want to route to.';
      case 'NS':
        return 'Add the nameserver domain name. It is important to end the domain name with a trailing dot (.) for correct DNS resolution.';
      case 'TXT':
        return 'Add the text you want to attach to your domain.';
      default:
        return 'Enter the record values.';
    }
  };

  useEffect(() => {
    if (showSkipMessage) {
      const timer = setTimeout(() => {
        setShowSkipMessage(false);
      }, 8000); // Hide after 8 seconds with smooth transition

      return () => clearTimeout(timer);
    }
  }, [showSkipMessage]);

  return (
    <PageLayout
      title={`Manage Hosted Zone - ${hostedZoneData.domainName}`}
      description='Configure DNS records and manage your hosted zone settings'
    >
      <div className='flex flex-col md:flex-row gap-6'>
        {/* Main Content */}
        <div className='flex-1 space-y-6'>
          {/* Skip Message for newly created zones */}
          {showSkipMessage && (
            <Card
              className='border-0 transition-all duration-500 ease-out'
              style={{
                background: 'linear-gradient(265deg, #E0F2E0 0%, #F0F7F0 100%)',
                opacity: showSkipMessage ? 1 : 0,
                transform: showSkipMessage
                  ? 'translateY(0)'
                  : 'translateY(-10px)',
              }}
            >
              <CardContent className='pt-4'>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='w-5 h-5 text-green-600 mt-0.5' />
                  <div className='flex-1'>
                    <h4 className='font-medium text-green-900'>
                      Hosted Zone Created Successfully!
                    </h4>
                    <p className='text-sm text-green-700 mt-1'>
                      You can now add DNS records to manage your domain's
                      routing, or skip this step and configure records later.
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setShowSkipMessage(false)}
                    className='text-green-600 hover:text-green-700'
                  >
                    ×
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hosted Zone Summary - matching VPC details page style */}
          <div
            className='mb-6 group relative'
            style={{
              borderRadius: '16px',
              border: '4px solid #FFF',
              background:
                'linear-gradient(265deg, #FFF -13.17%, #F7F8FD 133.78%)',
              boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)',
              padding: '1.5rem',
            }}
          >
            <DetailGrid>
              {/* Domain Name, Type, Status, Created On in first row */}
              <div className='col-span-full grid grid-cols-4 gap-4'>
                <div className='space-y-1'>
                  <label
                    className='text-sm font-normal text-gray-700'
                    style={{ fontSize: '13px' }}
                  >
                    Domain Name
                  </label>
                  <div className='font-medium' style={{ fontSize: '14px' }}>
                    {hostedZoneData.domainName}
                  </div>
                </div>
                <div className='space-y-1'>
                  <label
                    className='text-sm font-normal text-gray-700'
                    style={{ fontSize: '13px' }}
                  >
                    Type
                  </label>
                  <div>
                    <Badge
                      className={
                        hostedZoneData.type === 'Public'
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                      }
                    >
                      {hostedZoneData.type}
                    </Badge>
                  </div>
                </div>
                <div className='space-y-1'>
                  <label
                    className='text-sm font-normal text-gray-700'
                    style={{ fontSize: '13px' }}
                  >
                    Status
                  </label>
                  <div>
                    <StatusBadge status={hostedZoneData.status} />
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
                    {new Date(hostedZoneData.createdOn).toLocaleDateString()}{' '}
                    {new Date(hostedZoneData.createdOn).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Description removed as per requirements */}
            </DetailGrid>
          </div>

          {/* Associated VPCs Section */}
          <Card>
            <CardHeader className='pb-4'>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <CardTitle className='text-lg font-semibold'>VPCs</CardTitle>
                  <p className='text-sm text-muted-foreground mt-1'>
                    VPCs associated with this private hosted zone.
                  </p>
                </div>
                <Button
                  onClick={() => setIsAttachModalOpen(true)}
                  className='bg-black text-white hover:bg-black/90'
                >
                  Attach VPC
                </Button>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {associatedVpcs.length > 0 ? (
                <ShadcnDataTable
                  columns={vpcColumns}
                  data={associatedVpcs as any}
                  searchableColumns={['name', 'region']}
                  pageSize={5}
                  enableSearch={false}
                  enableColumnVisibility={false}
                  enablePagination={true}
                />
              ) : (
                <div className='border rounded-lg'>
                  <EmptyState
                    title='No VPCs associated'
                    description='This hosted zone is not associated with any VPCs.'
                    actionText=''
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attach VPC Modal */}
          <Dialog open={isAttachModalOpen} onOpenChange={setIsAttachModalOpen}>
            <DialogContent className='sm:max-w-[480px]'>
              <DialogHeader>
                <DialogTitle>Attach VPC</DialogTitle>
              </DialogHeader>
              <div className='space-y-4 pt-2'>
                {availableVpcsToAttach.length > 0 ? (
                  <div>
                    <Label className='block mb-2'>Select VPC</Label>
                    <Select
                      value={selectedAttachVpc}
                      onValueChange={value => setSelectedAttachVpc(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select a VPC' />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVpcsToAttach.map(v => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name} ({v.id}) • {v.region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    All available VPCs are already attached.
                  </p>
                )}
              </div>
              <div className='flex justify-end gap-3 pt-4'>
                <Button variant='outline' onClick={() => setIsAttachModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAttachVpc}
                  disabled={!selectedAttachVpc}
                  className={
                    selectedAttachVpc
                      ? 'bg-black text-white hover:bg-black/90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                >
                  Attach VPC
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* DNS Records Section */}
          <Card>
            <CardHeader className='pb-4'>
              <CardTitle className='text-lg font-semibold'>
                DNS Records
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Records Table */}
              <div>
                {dnsRecords.length > 0 ? (
                  <ShadcnDataTable
                    columns={dnsColumns}
                    data={dnsRecords}
                    searchableColumns={['recordName', 'value']}
                    pageSize={10}
                    enableSearch={false}
                    enableColumnVisibility={false}
                    enablePagination={true}
                  />
                ) : (
                  <div className='border rounded-lg'>
                    <EmptyState
                      {...getEmptyStateMessage('dns')}
                      onAction={() => {
                        // Scroll to Add DNS Record section
                        const addRecordSection =
                          document.getElementById('add-dns-record');
                        if (addRecordSection) {
                          addRecordSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                          });
                        }
                      }}
                      icon={dnsRecordsIcon}
                    />
                  </div>
                )}
              </div>

              {/* Add New Record Section */}
              <div id='add-dns-record' className='border-t pt-6'>
                <div className='flex items-center gap-2 mb-4'>
                  <h3 className='text-base font-semibold'>
                    Add New DNS Record
                  </h3>
                </div>

                <VercelTabs
                  tabs={[
                    { id: 'A', label: 'A' },
                    { id: 'AAAA', label: 'AAAA' },
                    { id: 'CNAME', label: 'CNAME' },
                    { id: 'MX', label: 'MX' },
                    { id: 'NS', label: 'NS' },
                    { id: 'TXT', label: 'TXT' },
                  ]}
                  activeTab={activeRecordTab}
                  onTabChange={setActiveRecordTab}
                  size='lg'
                />

                <div className='space-y-4 mt-6'>
                  <div className='text-sm text-muted-foreground mb-4'>
                    {getRecordTypeDescription(activeRecordTab)}
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Label htmlFor='recordName'>
                          Record Name{' '}
                          <span className='text-destructive'>*</span>
                        </Label>
                        <TooltipWrapper content='Name kept by the user to identify the DNS record'>
                          <HelpCircle className='h-4 w-4 text-muted-foreground hover:text-foreground cursor-help' />
                        </TooltipWrapper>
                      </div>
                      <Input
                        id='recordName'
                        placeholder='Enter record name'
                        value={recordForm.recordName}
                        onChange={e =>
                          setRecordForm(prev => ({
                            ...prev,
                            recordName: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Label htmlFor='ttl'>TTL</Label>
                        <TooltipWrapper content='Time To Live - how long DNS resolvers should cache this record'>
                          <HelpCircle className='h-4 w-4 text-muted-foreground hover:text-foreground cursor-help' />
                        </TooltipWrapper>
                      </div>
                      <Select
                        value={recordForm.ttl}
                        onValueChange={value =>
                          setRecordForm(prev => ({
                            ...prev,
                            ttl: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TTL_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(activeRecordTab === 'A' || activeRecordTab === 'AAAA') && (
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Label htmlFor='routingProtocol'>
                          Routing Protocol
                        </Label>
                        <TooltipWrapper content='Choose how DNS queries are routed to your resources. Simple routes to one IP, Weighted distributes traffic by percentage, GeoIP routes by location, HealthPort/HealthURL route only to healthy servers.'>
                          <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                        </TooltipWrapper>
                      </div>
                      <Select
                        value={recordForm.routingProtocol}
                        onValueChange={value =>
                          setRecordForm(prev => ({
                            ...prev,
                            routingProtocol: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {recordForm.routingProtocol
                              ? ROUTING_PROTOCOLS.find(
                                  p => p.value === recordForm.routingProtocol
                                )?.label
                              : 'Select routing protocol'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {ROUTING_PROTOCOLS.map(protocol => (
                            <SelectItem
                              key={protocol.value}
                              value={protocol.value}
                            >
                              {protocol.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Show selected routing protocol description */}
                      {recordForm.routingProtocol && (
                        <div className='mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md flex items-start gap-2'>
                          <Info className='h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0' />
                          <p className='text-sm text-gray-700 leading-relaxed'>
                            {
                              ROUTING_PROTOCOLS.find(
                                p => p.value === recordForm.routingProtocol
                              )?.description
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className='space-y-2'>
                    <Label>Record Values:</Label>
                    <p className='text-sm text-muted-foreground'>
                      {getRecordValuesDescription(activeRecordTab)}
                    </p>

                    {recordForm.routingProtocol === 'GeoIP' ? (
                      <div className='space-y-2'>
                        {geoipRecords.map((record, index) => (
                          <div key={index} className='flex gap-2 items-center'>
                            {record.type === 'Default' ? (
                              <div className='w-48'>
                                <div className='px-3 py-2 text-sm font-medium text-foreground bg-gray-50 border rounded-md'>
                                  Default
                                </div>
                              </div>
                            ) : (
                              <div className='w-48'>
                                <Select
                                  value={record.countryCode}
                                  onValueChange={value =>
                                    updateGeoipCountryCode(index, value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder='Select Country Code' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {COUNTRY_CODES.map(country => (
                                      <SelectItem
                                        key={country.value}
                                        value={country.value}
                                      >
                                        {country.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            <div className='flex-1'>
                              <Input
                                placeholder={
                                  activeRecordTab === 'A'
                                    ? 'Eg: "10.0.0.1, 10.0.0.2, 10.0.0.3"'
                                    : activeRecordTab === 'AAAA'
                                      ? 'Eg: "2001:db8::1, 2001:db8::2"'
                                      : 'Enter record value'
                                }
                                value={record.value}
                                onChange={e =>
                                  updateGeoipRecord(index, e.target.value)
                                }
                                className='flex-1'
                              />
                            </div>
                            <div className='flex gap-1'>
                              {record.canDelete && (
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='icon'
                                  onClick={() => removeGeoipRecord(index)}
                                  className='text-red-600 hover:text-red-700 hover:bg-red-50'
                                >
                                  <Trash2 className='w-4 h-4' />
                                </Button>
                              )}
                              {index === geoipRecords.length - 1 && (
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='icon'
                                  onClick={addGeoipRecord}
                                >
                                  <Plus className='w-4 h-4' />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recordForm.routingProtocol === 'HealthPort' ? (
                      <div className='space-y-4'>
                        {/* Port Field */}
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <Label htmlFor='port'>
                              Port <span className='text-destructive'>*</span>
                            </Label>
                            <TooltipWrapper content='The port number for health checks'>
                              <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                            </TooltipWrapper>
                          </div>
                          <Input
                            id='port'
                            type='number'
                            value={healthPortData.port}
                            onChange={e =>
                              updateHealthPortData('port', e.target.value)
                            }
                            placeholder='80'
                            className='w-full'
                          />
                        </div>

                        {/* Primary IPs Field */}
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <Label htmlFor='primaryIPs'>
                              Primary IPs{' '}
                              <span className='text-destructive'>*</span>
                            </Label>
                            <TooltipWrapper content='Primary IP addresses for health checks'>
                              <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                            </TooltipWrapper>
                          </div>
                          <Input
                            id='primaryIPs'
                            value={healthPortData.primaryIPs}
                            onChange={e =>
                              updateHealthPortData('primaryIPs', e.target.value)
                            }
                            placeholder='Enter primary IPs as a comma separated list'
                            className='w-full'
                          />
                        </div>

                        {/* Secondary IPs Field */}
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <Label htmlFor='secondaryIPs'>Secondary IPs</Label>
                            <TooltipWrapper content='Secondary IP addresses used when primary IPs are unhealthy'>
                              <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                            </TooltipWrapper>
                          </div>
                          <Input
                            id='secondaryIPs'
                            value={healthPortData.secondaryIPs}
                            onChange={e =>
                              updateHealthPortData(
                                'secondaryIPs',
                                e.target.value
                              )
                            }
                            placeholder='Enter secondary IPs as a comma separated list'
                            className='w-full'
                          />
                        </div>
                      </div>
                    ) : recordForm.routingProtocol === 'HealthURL' ? (
                      <div className='space-y-4'>
                        {/* URL Field */}
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <Label htmlFor='url'>
                              URL <span className='text-destructive'>*</span>
                            </Label>
                            <TooltipWrapper content='The URL endpoint for health checks'>
                              <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                            </TooltipWrapper>
                          </div>
                          <Input
                            id='url'
                            type='url'
                            value={healthURLData.url}
                            onChange={e =>
                              updateHealthURLData('url', e.target.value)
                            }
                            placeholder='https://example.com/health'
                            className='w-full'
                          />
                        </div>

                        {/* IPv4 Addresses Field */}
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <Label htmlFor='ipv4Addresses'>
                              IPv4 Addresses{' '}
                              <span className='text-destructive'>*</span>
                            </Label>
                            <TooltipWrapper content='IPv4 addresses to return when the URL health check passes'>
                              <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                            </TooltipWrapper>
                          </div>
                          <Input
                            id='ipv4Addresses'
                            value={healthURLData.ipv4Addresses}
                            onChange={e =>
                              updateHealthURLData(
                                'ipv4Addresses',
                                e.target.value
                              )
                            }
                            placeholder='Add IPv4 addresses as a comma separated list'
                            className='w-full'
                          />
                        </div>
                      </div>
                    ) : recordForm.routingProtocol === 'Weighted' ? (
                      <div className='space-y-2'>
                        {weightedValues.map((item, index) => (
                          <div key={index} className='flex gap-2'>
                            <Input
                              placeholder={
                                activeRecordTab === 'A'
                                  ? '203.0.113.1'
                                  : activeRecordTab === 'AAAA'
                                    ? '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
                                    : activeRecordTab === 'CNAME'
                                      ? 'webserver-01.yourcompany.com'
                                      : 'Enter record value'
                              }
                              value={item.value}
                              onChange={e =>
                                updateWeightedValue(index, e.target.value)
                              }
                              className='flex-1'
                            />
                            <Input
                              type='number'
                              placeholder='Weight'
                              value={item.weight}
                              onChange={e =>
                                updateWeightedWeight(index, e.target.value)
                              }
                              className='w-24'
                              min='1'
                              max='255'
                            />
                            <div className='flex gap-1'>
                              {weightedValues.length > 1 && (
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='icon'
                                  onClick={() => removeWeightedValue(index)}
                                  className='text-red-600 hover:text-red-700 hover:bg-red-50'
                                >
                                  <Trash2 className='w-4 h-4' />
                                </Button>
                              )}
                              {index === weightedValues.length - 1 && (
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='icon'
                                  onClick={addWeightedValue}
                                >
                                  <Plus className='w-4 h-4' />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='space-y-2'>
                        {recordValues.map((value, index) => (
                          <div key={index} className='flex gap-2'>
                            <Input
                              placeholder={
                                activeRecordTab === 'A'
                                  ? '203.0.113.1'
                                  : activeRecordTab === 'AAAA'
                                    ? '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
                                    : activeRecordTab === 'CNAME'
                                      ? 'webserver-01.yourcompany.com'
                                      : activeRecordTab === 'MX'
                                        ? '10 mx.example.net.'
                                        : activeRecordTab === 'NS'
                                          ? 'ns.nameserver.com.'
                                          : activeRecordTab === 'TXT'
                                            ? 'This is a text record'
                                            : 'Enter record value'
                              }
                              value={value}
                              onChange={e =>
                                updateRecordValue(index, e.target.value)
                              }
                              className='flex-1'
                            />
                            <div className='flex gap-1'>
                              {recordValues.length > 1 && (
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='icon'
                                  onClick={() => removeRecordValue(index)}
                                  className='text-red-600 hover:text-red-700 hover:bg-red-50'
                                >
                                  <Trash2 className='w-4 h-4' />
                                </Button>
                              )}
                              {index === recordValues.length - 1 && (
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='icon'
                                  onClick={addRecordValue}
                                >
                                  <Plus className='w-4 h-4' />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className='pt-4 border-t'>
                    <Button
                      onClick={handleAddRecord}
                      className='bg-black text-white hover:bg-black/90'
                      disabled={
                        !recordForm.recordName ||
                        (recordForm.routingProtocol === 'GeoIP'
                          ? !geoipRecords.some(r => r.value.trim())
                          : recordForm.routingProtocol === 'Weighted'
                            ? !weightedValues.some(
                                w => w.value.trim() && w.weight.trim()
                              )
                            : recordForm.routingProtocol === 'HealthPort'
                              ? !healthPortData.port.trim() ||
                                !healthPortData.primaryIPs.trim()
                              : recordForm.routingProtocol === 'HealthURL'
                                ? !healthURLData.url.trim() ||
                                  !healthURLData.ipv4Addresses.trim()
                                : !recordValues.some(v => v.trim()))
                      }
                    >
                      Add Record
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Done Button */}
          <div className='flex justify-end'>
            <Button
              onClick={() => router.push('/networking/dns')}
              className='bg-black text-white hover:bg-black/90'
            >
              Done
            </Button>
          </div>
        </div>

        {/* Side Panel */}
        <div className='w-full md:w-80 space-y-6'>
          {/* DNS Management Tips */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base font-normal'>
                DNS Best Practices
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
                    Use lower TTL values for testing and higher values for
                    production
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span
                    className='text-muted-foreground'
                    style={{ fontSize: '13px' }}
                  >
                    Always test DNS changes in a staging environment first
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span
                    className='text-muted-foreground'
                    style={{ fontSize: '13px' }}
                  >
                    Use CNAME records for subdomains that point to other domains
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span
                    className='text-muted-foreground'
                    style={{ fontSize: '13px' }}
                  >
                    Keep DNS records organized and documented
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Pricing Summary */}
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
                <h3 className='text-base font-semibold'>Pricing Summary</h3>
              </div>
            </div>
            <div>
              <div className='space-y-3'>
                <div className='flex items-baseline gap-2'>
                  <span className='text-2xl font-bold'>₹0.50</span>
                  <span className='text-sm text-muted-foreground'>
                    per month
                  </span>
                </div>
                <p className='text-sm text-muted-foreground'>
                  Per hosted zone. Includes 1 million queries per month.
                </p>
                <div className='text-xs text-muted-foreground pt-2 border-t'>
                  <p>• Hosted Zone: ₹0.50/month</p>
                  <p>• DNS queries: ₹0.40 per million</p>
                  <p>• Health checks: ₹0.50 per check/month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete DNS Record Modal */}
      {selectedRecord && (
        <DeleteDnsRecordModal
          open={isDeleteRecordModalOpen}
          onClose={handleDeleteRecordCancel}
          dnsRecord={{
            id: selectedRecord.id,
            recordName: selectedRecord.recordName,
            type: selectedRecord.type,
            value: selectedRecord.value,
          }}
          onConfirm={handleDeleteRecordConfirm}
        />
      )}

      {/* Edit DNS Record Modal */}
      <Dialog
        open={isEditRecordModalOpen}
        onOpenChange={setIsEditRecordModalOpen}
      >
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Edit DNS Record</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='editRecordName'>
                Record Name <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='editRecordName'
                placeholder='Enter record name'
                value={editForm.recordName}
                onChange={e =>
                  setEditForm(prev => ({
                    ...prev,
                    recordName: e.target.value,
                  }))
                }
              />
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Label htmlFor='editTtl'>TTL</Label>
                <TooltipWrapper content='Time To Live - how long DNS resolvers should cache this record'>
                  <HelpCircle className='h-4 w-4 text-muted-foreground hover:text-foreground cursor-help' />
                </TooltipWrapper>
              </div>
              <Select
                value={editForm.ttl}
                onValueChange={value =>
                  setEditForm(prev => ({
                    ...prev,
                    ttl: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TTL_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(editingRecord?.type === 'A' || editingRecord?.type === 'AAAA') && (
              <div className='space-y-2'>
                <Label htmlFor='editRoutingProtocol'>Routing Protocol</Label>
                <Select
                  value={editForm.routingProtocol}
                  onValueChange={value =>
                    setEditForm(prev => ({
                      ...prev,
                      routingProtocol: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue>
                      {editForm.routingProtocol
                        ? ROUTING_PROTOCOLS.find(
                            p => p.value === editForm.routingProtocol
                          )?.label
                        : 'Select routing protocol'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ROUTING_PROTOCOLS.map(protocol => (
                      <SelectItem key={protocol.value} value={protocol.value}>
                        {protocol.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {editForm.routingProtocol && (
                  <div className='mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md flex items-start gap-2'>
                    <Info className='h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0' />
                    <p className='text-sm text-gray-700 leading-relaxed'>
                      {
                        ROUTING_PROTOCOLS.find(
                          p => p.value === editForm.routingProtocol
                        )?.description
                      }
                    </p>
                  </div>
                )}

                <div className='space-y-2'>
                  <Label>Record Values:</Label>
                  <p className='text-sm text-muted-foreground'>
                    {getRecordValuesDescription(editingRecord?.type)}
                  </p>

                  {editForm.routingProtocol === 'GeoIP' ? (
                    <div className='space-y-2'>
                      {editGeoipRecords.map((record, index) => (
                        <div key={index} className='flex gap-2 items-center'>
                          {record.type === 'Default' ? (
                            <div className='w-48'>
                              <div className='px-3 py-2 text-sm font-medium text-foreground bg-gray-50 border rounded-md'>
                                Default
                              </div>
                            </div>
                          ) : (
                            <div className='w-48'>
                              <Select
                                value={record.countryCode}
                                onValueChange={value =>
                                  updateEditGeoipCountryCode(index, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder='Select Country Code' />
                                </SelectTrigger>
                                <SelectContent>
                                  {COUNTRY_CODES.map(country => (
                                    <SelectItem
                                      key={country.value}
                                      value={country.value}
                                    >
                                      {country.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          <div className='flex-1'>
                            <Input
                              placeholder={
                                editingRecord?.type === 'A'
                                  ? 'Eg: "10.0.0.1, 10.0.0.2, 10.0.0.3"'
                                  : editingRecord?.type === 'AAAA'
                                    ? 'Eg: "2001:db8::1, 2001:db8::2"'
                                    : 'Enter record value'
                              }
                              value={record.value}
                              onChange={e =>
                                updateEditGeoipRecord(index, e.target.value)
                              }
                              className='flex-1'
                            />
                          </div>
                          <div className='flex gap-1'>
                            {record.canDelete && (
                              <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                onClick={() => removeEditGeoipRecord(index)}
                                className='text-red-600 hover:text-red-700 hover:bg-red-50'
                              >
                                <Trash2 className='w-4 h-4' />
                              </Button>
                            )}
                            {index === editGeoipRecords.length - 1 && (
                              <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                onClick={addEditGeoipRecord}
                              >
                                <Plus className='w-4 h-4' />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : editForm.routingProtocol === 'HealthPort' ? (
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Label htmlFor='editPort'>
                            Port <span className='text-destructive'>*</span>
                          </Label>
                          <TooltipWrapper content='The port number for health checks'>
                            <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                          </TooltipWrapper>
                        </div>
                        <Input
                          id='editPort'
                          type='number'
                          value={editHealthPortData.port}
                          onChange={e => updateEditHealthPortData('port', e.target.value)}
                          placeholder='80'
                          className='w-full'
                        />
                      </div>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Label htmlFor='editPrimaryIPs'>
                            Primary IPs <span className='text-destructive'>*</span>
                          </Label>
                          <TooltipWrapper content='Primary IP addresses for health checks'>
                            <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                          </TooltipWrapper>
                        </div>
                        <Input
                          id='editPrimaryIPs'
                          value={editHealthPortData.primaryIPs}
                          onChange={e => updateEditHealthPortData('primaryIPs', e.target.value)}
                          placeholder='Enter primary IPs as a comma separated list'
                          className='w-full'
                        />
                      </div>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Label htmlFor='editSecondaryIPs'>Secondary IPs</Label>
                          <TooltipWrapper content='Secondary IP addresses used when primary IPs are unhealthy'>
                            <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                          </TooltipWrapper>
                        </div>
                        <Input
                          id='editSecondaryIPs'
                          value={editHealthPortData.secondaryIPs}
                          onChange={e => updateEditHealthPortData('secondaryIPs', e.target.value)}
                          placeholder='Enter secondary IPs as a comma separated list'
                          className='w-full'
                        />
                      </div>
                    </div>
                  ) : editForm.routingProtocol === 'HealthURL' ? (
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Label htmlFor='editUrl'>
                            URL <span className='text-destructive'>*</span>
                          </Label>
                          <TooltipWrapper content='The URL endpoint for health checks'>
                            <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                          </TooltipWrapper>
                        </div>
                        <Input
                          id='editUrl'
                          type='url'
                          value={editHealthURLData.url}
                          onChange={e => updateEditHealthURLData('url', e.target.value)}
                          placeholder='https://example.com/health'
                          className='w-full'
                        />
                      </div>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Label htmlFor='editIpv4'>
                            IPv4 Addresses <span className='text-destructive'>*</span>
                          </Label>
                          <TooltipWrapper content='IPv4 addresses to return when the URL health check passes'>
                            <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                          </TooltipWrapper>
                        </div>
                        <Input
                          id='editIpv4'
                          value={editHealthURLData.ipv4Addresses}
                          onChange={e => updateEditHealthURLData('ipv4Addresses', e.target.value)}
                          placeholder='Add IPv4 addresses as a comma separated list'
                          className='w-full'
                        />
                      </div>
                    </div>
                  ) : editForm.routingProtocol === 'Weighted' ? (
                    <div className='space-y-2'>
                      {editWeightedValues.map((item, index) => (
                        <div key={index} className='flex gap-2'>
                          <Input
                            placeholder={
                              editingRecord?.type === 'A'
                                ? '203.0.113.1'
                                : editingRecord?.type === 'AAAA'
                                  ? '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
                                  : 'Enter record value'
                            }
                            value={item.value}
                            onChange={e => updateEditWeightedValue(index, e.target.value)}
                            className='flex-1'
                          />
                          <Input
                            type='number'
                            placeholder='Weight'
                            value={item.weight}
                            onChange={e => updateEditWeightedWeight(index, e.target.value)}
                            className='w-24'
                            min='1'
                            max='255'
                          />
                          <div className='flex gap-1'>
                            {editWeightedValues.length > 1 && (
                              <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                onClick={() => removeEditWeightedValue(index)}
                                className='text-red-600 hover:text-red-700 hover:bg-red-50'
                              >
                                <Trash2 className='w-4 h-4' />
                              </Button>
                            )}
                            {index === editWeightedValues.length - 1 && (
                              <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                onClick={addEditWeightedValue}
                              >
                                <Plus className='w-4 h-4' />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      {editRecordValues.map((value, index) => (
                        <div key={index} className='flex gap-2'>
                          <Input
                            placeholder={
                              editingRecord?.type === 'A'
                                ? '203.0.113.1'
                                : editingRecord?.type === 'AAAA'
                                  ? '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
                                  : 'Enter record value'
                            }
                            value={value}
                            onChange={e => updateEditRecordValue(index, e.target.value)}
                            className='flex-1'
                          />
                          <div className='flex gap-1'>
                            {editRecordValues.length > 1 && (
                              <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                onClick={() => removeEditRecordValue(index)}
                                className='text-red-600 hover:text-red-700 hover:bg-red-50'
                              >
                                <Trash2 className='w-4 h-4' />
                              </Button>
                            )}
                            {index === editRecordValues.length - 1 && (
                              <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                onClick={addEditRecordValue}
                              >
                                <Plus className='w-4 h-4' />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={handleEditRecordCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleEditRecordSave}
              className='bg-black text-white hover:bg-black/90'
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
