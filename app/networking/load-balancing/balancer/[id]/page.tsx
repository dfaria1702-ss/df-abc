'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { PageLayout } from '@/components/page-layout';
import { DetailGrid } from '@/components/detail-grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { ShadcnDataTable } from '@/components/ui/shadcn-data-table';
import { StatusBadge } from '@/components/status-badge';
import {
  HealthIndicator,
  calculateOverallHealth,
} from '@/components/ui/health-indicator';
import { Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for demonstration - in real app, this would come from API
const mockLoadBalancers = {
  'lb-1': {
    id: 'lb-1',
    name: 'production-app-lb',
    description: 'Production application load balancer for web and API traffic',
    type: 'Application Load Balancer',
    scheme: 'internet-facing',
    status: 'active',
    dnsName: 'production-web-alb-123456789.ap-south-1.elb.amazonaws.com',
    region: 'ap-south-1',
    vpc: 'production-vpc',
    subnet: 'subnet-prod-1',
    availabilityZones: ['ap-south-1a', 'ap-south-1b'],
    created: '2024-01-15T10:30:00Z',
    targetGroupsDetails: [
      {
        id: 'tg-web-1',
        name: 'web-servers',
        healthyTargets: 3,
        totalTargets: 3,
        status: 'healthy',
      },
      {
        id: 'tg-api-1',
        name: 'api-servers',
        healthyTargets: 2,
        totalTargets: 2,
        status: 'healthy',
      },
    ],
    ipAddresses: ['10.0.1.45', '10.0.2.67', '10.0.3.89'],
    listeners: [
      {
        id: 'listener-001',
        name: 'web-listener',
        protocol: 'HTTPS',
        port: 443,
        alpnProtocol: 'h2',
        certificate: 'arn:aws:acm:ap-south-1:123456789:certificate/abcd-1234',
        certificateName: 'wildcard.example.com',
        policy: {
          id: 'policy-001',
          name: 'web-routing-policy',
          action: 'forward',
        },
        rule: {
          id: 'rule-001',
          ruleType: 'host-header',
          comparator: 'equals',
          value: 'www.example.com',
          key: '',
        },
        pool: {
          id: 'pool-001',
          name: 'web-pool',
          protocol: 'HTTP',
          algorithm: 'round-robin',
          targetGroup: 'production-web-targets',
          targetGroupStatus: 'healthy',
          targetCount: 4,
          healthyTargets: 4,
        },
      },
      {
        id: 'listener-002',
        name: 'api-listener',
        protocol: 'HTTPS',
        port: 8443,
        alpnProtocol: 'h2',
        certificate: 'arn:aws:acm:ap-south-1:123456789:certificate/abcd-1234',
        certificateName: 'api.example.com',
        policy: {
          id: 'policy-002',
          name: 'api-routing-policy',
          action: 'forward',
        },
        rule: {
          id: 'rule-002',
          ruleType: 'path-pattern',
          comparator: 'starts-with',
          value: '/api/',
          key: '',
        },
        pool: {
          id: 'pool-002',
          name: 'api-pool',
          protocol: 'HTTP',
          algorithm: 'least-connections',
          targetGroup: 'production-api-targets',
          targetGroupStatus: 'healthy',
          targetCount: 2,
          healthyTargets: 2,
        },
      },
    ],
  },
  'lb-3': {
    id: 'lb-3',
    name: 'internal-services-lb',
    description:
      'Internal network load balancer for high-performance TCP traffic',
    type: 'Network Load Balancer',
    scheme: 'internal',
    status: 'active',
    dnsName: 'production-tcp-nlb-123456789.ap-south-1.elb.amazonaws.com',
    region: 'ap-south-1',
    vpc: 'production-vpc',
    subnet: 'subnet-prod-3',
    availabilityZones: ['ap-south-1a', 'ap-south-1b'],
    created: '2024-01-20T14:20:00Z',
    targetGroupsDetails: [
      {
        id: 'tg-tcp-1',
        name: 'tcp-services',
        healthyTargets: 4,
        totalTargets: 4,
        status: 'healthy',
      },
    ],
    ipAddresses: ['10.0.6.12', '10.0.7.34'],
    listeners: [
      {
        id: 'listener-003',
        name: 'tcp-listener',
        protocol: 'TCP',
        port: 80,
        alpnProtocol: '',
        certificate: '',
        certificateName: '',
        // No policy/rules for NLB
        pool: {
          id: 'pool-003',
          name: 'tcp-pool',
          protocol: 'TCP',
          algorithm: 'round-robin',
          targetGroup: 'database-targets',
          targetGroupStatus: 'healthy',
          targetCount: 2,
          healthyTargets: 2,
        },
      },
    ],
  },
  'lb-2': {
    id: 'lb-2',
    name: 'api-gateway-lb',
    description: 'API gateway load balancer for microservices routing',
    type: 'Application Load Balancer',
    scheme: 'internet-facing',
    status: 'active',
    dnsName: 'api-gateway-lb-123456789.ap-south-1.elb.amazonaws.com',
    region: 'ap-south-1',
    vpc: 'production-vpc',
    subnet: 'subnet-prod-2',
    availabilityZones: ['ap-south-1a', 'ap-south-1b'],
    created: '2024-01-18T12:15:00Z',
    targetGroupsDetails: [
      {
        id: 'tg-api-gateway-1',
        name: 'api-gateway',
        healthyTargets: 2,
        totalTargets: 2,
        status: 'healthy',
      },
    ],
    ipAddresses: ['10.0.4.23', '10.0.5.78'],
    listeners: [
      {
        id: 'listener-004',
        name: 'api-listener',
        protocol: 'HTTPS',
        port: 443,
        alpnProtocol: 'h2',
        certificate: 'arn:aws:acm:ap-south-1:123456789:certificate/api-cert',
        certificateName: 'api.example.com',
        policy: {
          id: 'policy-003',
          name: 'api-routing-policy',
          action: 'forward',
        },
        rule: {
          id: 'rule-003',
          ruleType: 'path-pattern',
          comparator: 'starts-with',
          value: '/api/',
          key: '',
        },
        pool: {
          id: 'pool-004',
          name: 'api-pool',
          protocol: 'HTTP',
          algorithm: 'round-robin',
          targetGroup: 'api-targets',
          targetGroupStatus: 'healthy',
          targetCount: 3,
          healthyTargets: 3,
        },
      },
    ],
  },
  'lb-5': {
    id: 'lb-5',
    name: 'dev-app-lb',
    description:
      'Development application load balancer currently being provisioned',
    type: 'Application Load Balancer',
    scheme: 'internet-facing',
    status: 'provisioning',
    dnsName: 'dev-app-lb-123456789.ap-south-1.elb.amazonaws.com',
    region: 'ap-south-1',
    vpc: 'development-vpc',
    subnet: 'subnet-dev-1',
    availabilityZones: ['ap-south-1a'],
    created: '2024-02-01T09:00:00Z',
    targetGroupsDetails: [
      {
        id: 'tg-dev-1',
        name: 'dev-web',
        healthyTargets: 0,
        totalTargets: 2,
        status: 'unhealthy',
      },
    ],
    ipAddresses: [],
    listeners: [
      {
        id: 'listener-005',
        name: 'dev-web-listener',
        protocol: 'HTTP',
        port: 80,
        alpnProtocol: '',
        certificate: '',
        certificateName: '',
        policy: {
          id: 'policy-004',
          name: 'dev-routing-policy',
          action: 'forward',
        },
        rule: {
          id: 'rule-004',
          ruleType: 'host-header',
          comparator: 'equals',
          value: 'dev.example.com',
          key: '',
        },
        pool: {
          id: 'pool-005',
          name: 'dev-pool',
          protocol: 'HTTP',
          algorithm: 'round-robin',
          targetGroup: 'dev-targets',
          targetGroupStatus: 'healthy',
          targetCount: 1,
          healthyTargets: 1,
        },
      },
    ],
  },
  'lb-4': {
    id: 'lb-4',
    name: 'staging-web-lb',
    description: 'Staging environment web load balancer for testing',
    type: 'Application Load Balancer',
    scheme: 'internet-facing',
    status: 'error',
    dnsName: 'staging-web-lb-111222333.us-west-2.elb.amazonaws.com',
    region: 'us-west-2',
    vpc: 'staging-vpc',
    subnet: 'subnet-staging-1',
    availabilityZones: ['us-west-2a', 'us-west-2b'],
    created: '2024-01-10T16:20:00Z',
    targetGroupsDetails: [
      {
        id: 'tg-staging-web-1',
        name: 'staging-web',
        healthyTargets: 0,
        totalTargets: 2,
        status: 'unhealthy',
      },
    ],
    ipAddresses: ['10.0.8.15', '10.0.9.22'],
    listeners: [
      {
        id: 'listener-006',
        name: 'staging-web-listener',
        protocol: 'HTTP',
        port: 80,
        alpnProtocol: '',
        certificate: '',
        certificateName: '',
        policy: {
          id: 'policy-005',
          name: 'staging-routing-policy',
          action: 'forward',
        },
        rule: {
          id: 'rule-005',
          ruleType: 'path-pattern',
          comparator: 'equals',
          value: '/',
          key: '',
        },
        pool: {
          id: 'pool-005',
          name: 'staging-pool',
          protocol: 'HTTP',
          algorithm: 'round-robin',
          targetGroup: 'staging-web-targets',
          targetGroupStatus: 'unhealthy',
          targetCount: 2,
          healthyTargets: 0,
        },
      },
    ],
  },
};

function getLoadBalancer(id: string) {
  return mockLoadBalancers[id as keyof typeof mockLoadBalancers] || null;
}

// Helper function to calculate target group health summary
const calculateTargetGroupSummary = (targetGroups: any[]) => {
  if (targetGroups.length === 0) {
    return { healthy: 0, mixed: 0, unhealthy: 0, total: 0 };
  }

  let healthy = 0;
  let mixed = 0;
  let unhealthy = 0;

  targetGroups.forEach(tg => {
    if (tg.status === 'healthy') {
      healthy++;
    } else if (tg.status === 'mixed') {
      mixed++;
    } else if (tg.status === 'unhealthy') {
      unhealthy++;
    }
  });

  return { healthy, mixed, unhealthy, total: targetGroups.length };
};

// Helper function to format summary text
const formatSummaryText = (summary: {
  healthy: number;
  mixed: number;
  unhealthy: number;
  total: number;
}) => {
  const parts = [];

  if (summary.healthy > 0) {
    parts.push(`${summary.healthy} healthy`);
  }
  if (summary.mixed > 0) {
    parts.push(`${summary.mixed} mixed`);
  }
  if (summary.unhealthy > 0) {
    parts.push(`${summary.unhealthy} unhealthy`);
  }

  return parts.join(', ');
};

export default function LoadBalancerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expandedTargetGroups, setExpandedTargetGroups] = useState(false);

  // Unwrap the params Promise using React.use()
  const { id } = use(params);
  const loadBalancer = getLoadBalancer(id);

  if (!loadBalancer) {
    notFound();
  }

  const handleDelete = () => {
    console.log('Deleting Load Balancer:', loadBalancer.name);

    toast({
      title: 'Load balancer deleted successfully',
      description: `Load Balancer "${loadBalancer.name}" has been deleted.`,
    });

    router.push('/networking/load-balancing/balancer');
  };

  const handleEdit = () => {
    router.push(`/networking/load-balancing/balancer/${id}/edit`);
  };

  // Determine if this is ALB or NLB
  const isALB = loadBalancer.type === 'Application Load Balancer';

  const customBreadcrumbs = [
    { href: '/dashboard', title: 'Home' },
    { href: '/networking', title: 'Networking' },
    { href: '/networking/load-balancing', title: 'Load Balancers' },
    { href: '/networking/load-balancing/balancer', title: 'Load Balancers' },
    {
      href: `/networking/load-balancing/balancer/${id}`,
      title: loadBalancer.name,
    },
  ];

  return (
    <PageLayout
      title={loadBalancer.name}
      customBreadcrumbs={customBreadcrumbs}
      hideViewDocs={true}
    >
      {/* Load Balancer Basic Information */}
      <div
        className='group relative'
        style={{
          borderRadius: '16px',
          border: '4px solid #FFF',
          background: 'linear-gradient(265deg, #FFF -13.17%, #F7F8FD 133.78%)',
          boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)',
          padding: '1.5rem',
        }}
      >
        {/* Overlay Edit/Delete Buttons */}
        <div className='absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleEdit}
            className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
          >
            <Edit className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsDeleteModalOpen(true)}
            className='h-8 w-8 p-0 text-muted-foreground hover:text-red-600 bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>

        <DetailGrid>
          {/* Basic Details from Create Form - First Row: Name, Description, Type */}
          <div className='col-span-full grid grid-cols-3 gap-4'>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Load Balancer Name
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {loadBalancer.name}
              </div>
            </div>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Description
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {loadBalancer.description || 'No description provided'}
              </div>
            </div>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Load Balancer Type
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {loadBalancer.type}
              </div>
            </div>
          </div>

          {/* Network Configuration from Create Form - Second Row: Region, VPC, Subnet */}
          <div className='col-span-full grid grid-cols-3 gap-4 mt-4'>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Region
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {loadBalancer.region}
              </div>
            </div>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                VPC
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {loadBalancer.vpc}
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
                {loadBalancer.subnet}
              </div>
            </div>
          </div>

          {/* Runtime Information from List Page - Third Row: Provisioning Status, Operating Status, Target Group Health, IP Addresses */}
          <div className='col-span-full grid grid-cols-4 gap-4 mt-4'>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Provisioning Status
              </label>
              <div>
                <StatusBadge status={loadBalancer.provisioningStatus} />
              </div>
            </div>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Operating Status
              </label>
              <div>
                <StatusBadge status={loadBalancer.operatingStatus} />
              </div>
            </div>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Target Group Health
              </label>
              <div>
                {(() => {
                  const targetGroups = loadBalancer.targetGroupsDetails || [];

                  // Handle no target groups case
                  if (targetGroups.length === 0) {
                    return (
                      <div className='space-y-2'>
                        <HealthIndicator
                          status='no-targets'
                          size='sm'
                          showLabel={true}
                        />
                        <span className='text-muted-foreground text-sm'>
                          No target groups
                        </span>
                      </div>
                    );
                  }

                  // Calculate overall health status
                  const overallHealth = calculateOverallHealth(
                    targetGroups,
                    loadBalancer.operatingStatus
                  );

                  // Calculate summary
                  const summary = calculateTargetGroupSummary(targetGroups);
                  const summaryText = formatSummaryText(summary);

                  return (
                    <div className='space-y-2'>
                      {/* Aggregate Health Indicator */}
                      <HealthIndicator
                        status={overallHealth}
                        size='sm'
                        showLabel={true}
                      />

                      {/* Expandable Details */}
                      <div className='space-y-1'>
                        <div
                          className='flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity'
                          onClick={() =>
                            setExpandedTargetGroups(!expandedTargetGroups)
                          }
                        >
                          <ChevronRight
                            className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
                              expandedTargetGroups ? 'rotate-90' : 'rotate-0'
                            }`}
                          />
                          <div className='text-sm'>
                            <div className='font-medium'>
                              {summary.total} Target Group
                              {summary.total !== 1 ? 's' : ''}
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              {summaryText || 'All configured'}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedTargetGroups && (
                          <div className='pl-4 space-y-1 border-l-2 border-muted animate-in slide-in-from-top-2 duration-200'>
                            {targetGroups.map((tg: any) => {
                              // If operating status is inactive, show as not healthy
                              const isInactive =
                                loadBalancer.operatingStatus === 'inactive';
                              const healthText = isInactive
                                ? 'Not healthy (LB inactive)'
                                : tg.totalTargets === 0
                                  ? 'No targets'
                                  : `${tg.healthyTargets}/${tg.totalTargets} healthy`;

                              let healthColor = 'text-muted-foreground';
                              if (isInactive) {
                                healthColor = 'text-red-600';
                              } else if (tg.status === 'healthy') {
                                healthColor = 'text-green-600';
                              } else if (tg.status === 'unhealthy') {
                                healthColor = 'text-red-600';
                              } else if (tg.status === 'mixed') {
                                healthColor = 'text-orange-600';
                              }

                              return (
                                <div
                                  key={tg.id}
                                  className='flex items-center justify-between text-xs'
                                >
                                  <span className='font-medium text-muted-foreground'>
                                    {tg.name}
                                  </span>
                                  <span className={healthColor}>
                                    {healthText}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                IP Addresses
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {loadBalancer.ipAddresses?.length > 0 ? (
                  loadBalancer.ipAddresses.length > 2 ? (
                    <div className='space-y-1'>
                      <div>
                        {loadBalancer.ipAddresses.slice(0, 2).join(', ')}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        +{loadBalancer.ipAddresses.length - 2} more
                      </div>
                    </div>
                  ) : (
                    loadBalancer.ipAddresses.join(', ')
                  )
                ) : (
                  <span className='text-muted-foreground'>—</span>
                )}
              </div>
            </div>
          </div>
        </DetailGrid>
      </div>

      {/* Listeners */}
      <Card className='mt-4'>
        <CardContent className='pt-6 space-y-6'>
          <div className='flex items-center gap-2'>
            <h2 className='text-lg font-semibold'>Listeners</h2>
            <div className='flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground text-sm font-medium rounded-full'>
              {loadBalancer.listeners.length}
            </div>
          </div>

          <div className='space-y-6'>
            {loadBalancer.listeners.map((listener, index) => (
              <Card key={listener.id} className='overflow-hidden'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>
                {listener.name} ({listener.protocol}:{listener.port})
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Listener Settings */}
              <div className='space-y-4'>
                <h4 className='font-medium text-sm text-gray-700'>
                  Listener Settings
                </h4>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20'>
                  <div className='space-y-1'>
                    <label
                      className='text-sm font-normal text-gray-700'
                      style={{ fontSize: '13px' }}
                    >
                      Protocol
                    </label>
                    <div className='font-medium' style={{ fontSize: '14px' }}>
                      {listener.protocol}
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <label
                      className='text-sm font-normal text-gray-700'
                      style={{ fontSize: '13px' }}
                    >
                      Port
                    </label>
                    <div className='font-medium' style={{ fontSize: '14px' }}>
                      {listener.port}
                    </div>
                  </div>
                  {listener.alpnProtocol && (
                    <div className='space-y-1'>
                      <label
                        className='text-sm font-normal text-gray-700'
                        style={{ fontSize: '13px' }}
                      >
                        ALPN Protocol
                      </label>
                      <div className='font-medium' style={{ fontSize: '14px' }}>
                        {listener.alpnProtocol}
                      </div>
                    </div>
                  )}
                  {listener.certificateName && (
                    <div className='space-y-1'>
                      <label
                        className='text-sm font-normal text-gray-700'
                        style={{ fontSize: '13px' }}
                      >
                        SSL Certificate
                      </label>
                      <div className='font-medium' style={{ fontSize: '14px' }}>
                        {listener.certificateName}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Policy & Rules Configuration (only for ALB) */}
              {isALB && listener.policy && listener.rule && (
                <>
                  <Separator />
                  <div className='space-y-4'>
                    <h4 className='font-medium text-sm text-gray-700'>
                      Policy & Rules Configuration
                    </h4>

                    {/* Policy Configuration */}
                    <div className='space-y-3'>
                      <h5 className='font-medium text-sm'>
                        Policy Configuration
                      </h5>
                      <div className='grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20'>
                        <div className='space-y-1'>
                          <label
                            className='text-sm font-normal text-gray-700'
                            style={{ fontSize: '13px' }}
                          >
                            Policy Name
                          </label>
                          <div
                            className='font-medium'
                            style={{ fontSize: '14px' }}
                          >
                            {listener.policy.name}
                          </div>
                        </div>
                        <div className='space-y-1'>
                          <label
                            className='text-sm font-normal text-gray-700'
                            style={{ fontSize: '13px' }}
                          >
                            Action
                          </label>
                          <div
                            className='font-medium'
                            style={{ fontSize: '14px' }}
                          >
                            {listener.policy.action}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rule Configuration */}
                    <div className='space-y-3'>
                      <h5 className='font-medium text-sm'>
                        Rule Configuration
                      </h5>
                      <div className='grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/20'>
                        <div className='space-y-1'>
                          <label
                            className='text-sm font-normal text-gray-700'
                            style={{ fontSize: '13px' }}
                          >
                            Rule Type
                          </label>
                          <div
                            className='font-medium'
                            style={{ fontSize: '14px' }}
                          >
                            {listener.rule.ruleType}
                          </div>
                        </div>
                        <div className='space-y-1'>
                          <label
                            className='text-sm font-normal text-gray-700'
                            style={{ fontSize: '13px' }}
                          >
                            Comparator
                          </label>
                          <div
                            className='font-medium'
                            style={{ fontSize: '14px' }}
                          >
                            {listener.rule.comparator}
                          </div>
                        </div>
                        <div className='space-y-1'>
                          <label
                            className='text-sm font-normal text-gray-700'
                            style={{ fontSize: '13px' }}
                          >
                            Value
                          </label>
                          <div
                            className='font-medium'
                            style={{ fontSize: '14px' }}
                          >
                            {listener.rule.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Pool Configuration */}
              <Separator />
              <div className='space-y-4'>
                <h4 className='font-medium text-sm text-gray-700'>
                  Pool Configuration
                </h4>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20'>
                  <div className='space-y-1'>
                    <label
                      className='text-sm font-normal text-gray-700'
                      style={{ fontSize: '13px' }}
                    >
                      Pool Name
                    </label>
                    <div className='font-medium' style={{ fontSize: '14px' }}>
                      {listener.pool.name}
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <label
                      className='text-sm font-normal text-gray-700'
                      style={{ fontSize: '13px' }}
                    >
                      Protocol
                    </label>
                    <div className='font-medium' style={{ fontSize: '14px' }}>
                      {listener.pool.protocol}
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <label
                      className='text-sm font-normal text-gray-700'
                      style={{ fontSize: '13px' }}
                    >
                      Algorithm
                    </label>
                    <div className='font-medium' style={{ fontSize: '14px' }}>
                      {listener.pool.algorithm}
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <label
                      className='text-sm font-normal text-gray-700'
                      style={{ fontSize: '13px' }}
                    >
                      Target Group
                    </label>
                    <div className='flex items-center gap-2'>
                      <span
                        className='font-medium'
                        style={{ fontSize: '14px' }}
                      >
                        {listener.pool.targetGroup}
                      </span>
                      <StatusBadge status={listener.pool.targetGroupStatus} />
                    </div>
                  </div>
                </div>

                {/* Target Group Summary */}
                <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                  <div className='text-sm'>
                    <div className='font-medium mb-1'>Target Group Health</div>
                    <div className='text-xs text-muted-foreground'>
                      {listener.pool.healthyTargets} of{' '}
                      {listener.pool.targetCount} targets are healthy
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        resourceName={loadBalancer.name}
        resourceType='load balancer'
      />
    </PageLayout>
  );
}
