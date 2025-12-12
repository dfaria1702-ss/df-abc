'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { ALBCreateForm } from '../../create/components/alb-create-form';
import { NLBCreateForm } from '../../create/components/nlb-create-form';
import type { LoadBalancerConfiguration } from '../../create/page';

// Mock data from details page - in real app, this would come from API
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
    performanceTier: 'standard',
    standardConfig: 'high-availability',
    ipAddressType: 'floating-ip',
    listeners: [
      {
        id: 'listener-001',
        name: 'web-listener',
        protocol: 'HTTPS',
        port: 443,
        certificate: 'cert-1',
        policies: [
          {
            id: 'policy-001',
            name: 'web-routing-policy',
            action: 'forward',
          },
        ],
        rules: [
          {
            id: 'rule-001',
            ruleType: 'host-header',
            comparator: 'equals',
            value: 'www.example.com',
            key: '',
          },
        ],
        pools: [
          {
            id: 'pool-001',
            name: 'web-pool',
            protocol: 'HTTP',
            algorithm: 'round-robin',
            targetGroup: 'production-web-targets',
          },
        ],
      },
      {
        id: 'listener-002',
        name: 'api-listener',
        protocol: 'HTTPS',
        port: 8443,
        certificate: 'cert-1',
        policies: [
          {
            id: 'policy-002',
            name: 'api-routing-policy',
            action: 'forward',
          },
        ],
        rules: [
          {
            id: 'rule-002',
            ruleType: 'path-pattern',
            comparator: 'starts-with',
            value: '/api/',
            key: '',
          },
        ],
        pools: [
          {
            id: 'pool-002',
            name: 'api-pool',
            protocol: 'HTTP',
            algorithm: 'least-connections',
            targetGroup: 'production-api-targets',
          },
        ],
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
    region: 'ap-south-1',
    vpc: 'production-vpc',
    subnet: 'subnet-prod-2',
    performanceTier: 'standard',
    standardConfig: 'standalone',
    ipAddressType: 'reserve-ip',
    listeners: [
      {
        id: 'listener-004',
        name: 'api-listener',
        protocol: 'HTTPS',
        port: 443,
        certificate: 'cert-3',
        policies: [
          {
            id: 'policy-003',
            name: 'api-routing-policy',
            action: 'forward',
          },
        ],
        rules: [
          {
            id: 'rule-003',
            ruleType: 'path-pattern',
            comparator: 'starts-with',
            value: '/api/',
            key: '',
          },
        ],
        pools: [
          {
            id: 'pool-004',
            name: 'api-pool',
            protocol: 'HTTP',
            algorithm: 'round-robin',
            targetGroup: 'api-targets',
          },
        ],
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
    region: 'ap-south-1',
    vpc: 'production-vpc',
    subnet: 'subnet-prod-3',
    performanceTier: 'standard',
    standardConfig: 'high-availability',
    ipAddressType: 'floating-ip',
    listeners: [
      {
        id: 'listener-003',
        name: 'tcp-listener',
        protocol: 'TCP',
        port: 80,
        certificate: '',
        pools: [
          {
            id: 'pool-003',
            name: 'tcp-pool',
            protocol: 'TCP',
            algorithm: 'round-robin',
            targetGroup: 'database-targets',
          },
        ],
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
    region: 'us-west-2',
    vpc: 'staging-vpc',
    subnet: 'subnet-staging-1',
    performanceTier: 'standard',
    standardConfig: 'standalone',
    ipAddressType: 'floating-ip',
    listeners: [
      {
        id: 'listener-006',
        name: 'staging-web-listener',
        protocol: 'HTTP',
        port: 80,
        certificate: '',
        policies: [
          {
            id: 'policy-005',
            name: 'staging-routing-policy',
            action: 'forward',
          },
        ],
        rules: [
          {
            id: 'rule-005',
            ruleType: 'path-pattern',
            comparator: 'equals',
            value: '/',
            key: '',
          },
        ],
        pools: [
          {
            id: 'pool-005',
            name: 'staging-pool',
            protocol: 'HTTP',
            algorithm: 'round-robin',
            targetGroup: 'staging-web-targets',
          },
        ],
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
    region: 'ap-south-1',
    vpc: 'development-vpc',
    subnet: 'subnet-dev-1',
    performanceTier: 'standard',
    standardConfig: 'standalone',
    ipAddressType: 'floating-ip',
    listeners: [
      {
        id: 'listener-005',
        name: 'dev-web-listener',
        protocol: 'HTTP',
        port: 80,
        certificate: '',
        policies: [
          {
            id: 'policy-004',
            name: 'dev-routing-policy',
            action: 'forward',
          },
        ],
        rules: [
          {
            id: 'rule-004',
            ruleType: 'host-header',
            comparator: 'equals',
            value: 'dev.example.com',
            key: '',
          },
        ],
        pools: [
          {
            id: 'pool-005',
            name: 'dev-pool',
            protocol: 'HTTP',
            algorithm: 'round-robin',
            targetGroup: 'dev-targets',
          },
        ],
      },
    ],
  },
  'lb-6': {
    id: 'lb-6',
    name: 'database-tcp-lb',
    description: 'Network load balancer for database connection pooling',
    type: 'Network Load Balancer',
    scheme: 'internal',
    status: 'active',
    region: 'us-east-1',
    vpc: 'production-vpc',
    subnet: 'subnet-prod-1',
    performanceTier: 'standard',
    standardConfig: 'standalone',
    ipAddressType: 'reserve-ip',
    listeners: [
      {
        id: 'listener-007',
        name: 'db-tcp-listener',
        protocol: 'TCP',
        port: 5432,
        certificate: '',
        pools: [
          {
            id: 'pool-007',
            name: 'postgres-pool',
            protocol: 'TCP',
            algorithm: 'least-connections',
            targetGroup: 'postgres-targets',
          },
        ],
      },
    ],
  },
  'lb-7': {
    id: 'lb-7',
    name: 'udp-game-lb',
    description: 'Network load balancer for UDP game traffic',
    type: 'Network Load Balancer',
    scheme: 'internet-facing',
    status: 'active',
    region: 'us-west-2',
    vpc: 'gaming-vpc',
    subnet: 'subnet-game-1',
    performanceTier: 'standard',
    standardConfig: 'high-availability',
    ipAddressType: 'floating-ip',
    listeners: [
      {
        id: 'listener-008',
        name: 'game-udp-listener',
        protocol: 'UDP',
        port: 7777,
        certificate: '',
        pools: [
          {
            id: 'pool-008',
            name: 'game-servers-pool',
            protocol: 'UDP',
            algorithm: 'round-robin',
            targetGroup: 'game-server-targets',
          },
        ],
      },
    ],
  },
};

function getLoadBalancer(id: string) {
  return mockLoadBalancers[id as keyof typeof mockLoadBalancers] || null;
}

export default function EditLoadBalancerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [listenersEditMode, setListenersEditMode] = useState(false);

  // Unwrap the params Promise using React.use()
  const { id } = use(params);
  const loadBalancer = getLoadBalancer(id);

  if (!loadBalancer) {
    notFound();
  }

  // Create a LoadBalancerConfiguration object
  const config: LoadBalancerConfiguration = {
    loadBalancerType:
      loadBalancer.type === 'Application Load Balancer' ? 'ALB' : 'NLB',
    region: loadBalancer.region,
    vpc: loadBalancer.vpc,
  };

  const handleCancel = () => {
    router.push(`/networking/load-balancing/balancer/${id}`);
  };

  const handleToggleListenersEdit = () => {
    setListenersEditMode(prev => !prev);
  };

  const customBreadcrumbs = [
    { href: '/dashboard', title: 'Home' },
    { href: '/networking', title: 'Networking' },
    { href: '/networking/load-balancing', title: 'Load Balancers' },
    { href: '/networking/load-balancing/balancer', title: 'Load Balancers' },
    {
      href: `/networking/load-balancing/balancer/${id}`,
      title: loadBalancer.name,
    },
    { href: `/networking/load-balancing/balancer/${id}/edit`, title: 'Edit' },
  ];

  // Render appropriate form based on load balancer type
  if (loadBalancer.type === 'Application Load Balancer') {
    return (
      <ALBCreateForm
        config={config}
        onBack={() => router.push(`/networking/load-balancing/balancer/${id}`)}
        onCancel={handleCancel}
        isEditMode={true}
        editData={loadBalancer}
        customBreadcrumbs={customBreadcrumbs}
        listenersEditMode={listenersEditMode}
        onToggleListenersEdit={handleToggleListenersEdit}
      />
    );
  } else {
    return (
      <NLBCreateForm
        config={config}
        onBack={() => router.push(`/networking/load-balancing/balancer/${id}`)}
        onCancel={handleCancel}
        isEditMode={true}
        editData={loadBalancer}
        customBreadcrumbs={customBreadcrumbs}
        listenersEditMode={listenersEditMode}
        onToggleListenersEdit={handleToggleListenersEdit}
      />
    );
  }
}
