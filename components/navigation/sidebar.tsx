'use client';

import type React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Server,
  Network,
  Database,
  Boxes,
  Brain,
  Code,
  Microscope,
  Map,
  Shield,
  Settings,
  CreditCard,
  BookOpen,
  GraduationCap,
  ChevronRight,
  MessageSquare,
  FileSearch,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';

/**
 * @deprecated
 * NOT CURRENTLY USED IN THE APPLICATION
 *
 * This component is not currently used in the main application.
 * It's kept for reference or potential future use but should not be modified
 * as part of regular application updates.
 *
 * Last reviewed: April 24, 2025
 */
interface NavigationItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  items?: { title: string; href: string }[];
}

interface NavigationCategory {
  title: string;
  items: NavigationItem[];
}

const navigationStructure: NavigationCategory[] = [
  {
    title: 'CORE INFRASTRUCTURE',
    items: [
      {
        title: 'Compute & Scaling',
        href: '/compute',
        icon: <Server className='h-5 w-5' />,
        items: [
          { title: 'Machines', href: '/compute/machines' },
          { title: 'AI Pods', href: '/compute/ai-pods' },
          { title: 'Auto Scaling Groups', href: '/compute/auto-scaling' },
          { title: 'SSH Keys', href: '/compute/ssh-keys' },
        ],
      },
      {
        title: 'Storage',
        href: '/storage',
        icon: <Database className='h-5 w-5' />,
        items: [
          { title: 'Object Storage', href: '/storage/object' },
          { title: 'Block Storage', href: '/storage/block' },
        ],
      },
      {
        title: 'Networking',
        href: '/networking',
        icon: <Network className='h-5 w-5' />,
        items: [
          { title: 'Network Security', href: '/networking/security' },
          { title: 'Load Balancing', href: '/networking/load-balancing' },
          { title: 'DNS', href: '/networking/dns' },
        ],
      },
      {
        title: 'Kubernetes',
        href: '/kubernetes',
        icon: <Boxes className='h-5 w-5' />,
      },
    ],
  },
  {
    title: 'AI & INTELLIGENT SERVICES',
    items: [
      {
        title: 'Model Hub',
        href: '/model-hub',
        icon: <Brain className='h-5 w-5' />,
        items: [
          { title: 'Model Catalog', href: '/model-hub/catalog' },
          { title: 'My Models', href: '/model-hub/my-models' },
          {
            title: 'Models as a Service',
            href: '/model-hub/models-as-service',
          },
        ],
      },
      {
        title: 'Model Development',
        href: '/model-dev',
        icon: <Code className='h-5 w-5' />,
        items: [
          { title: 'Fine-Tuning', href: '/model-dev/fine-tuning' },
          { title: 'Evaluation', href: '/model-dev/evaluation' },
        ],
      },
      {
        title: 'Bhashik Language AI',
        href: '/bhashik',
        icon: <MessageSquare className='h-5 w-5' />,
        items: [
          { title: 'Text Services', href: '/bhashik/text' },
          { title: 'Speech Services', href: '/bhashik/speech' },
        ],
      },
      {
        title: 'Document Intelligence',
        href: '/doc-intelligence',
        icon: <FileSearch className='h-5 w-5' />,
        items: [
          { title: 'All Services', href: '/doc-intelligence' },
          { title: 'Extract Text', href: '/playground/extract-text' },
          { title: 'Extract Information', href: '/playground/extract-info' },
          { title: 'Doc Summarization', href: '/playground/doc-summarization' },
          { title: 'PII Masking', href: '/playground/pii-masking' },
        ],
      },
      {
        title: 'AI Solutions',
        href: '/ai-solutions',
        icon: <Microscope className='h-5 w-5' />,
        items: [
          {
            title: 'Industrial Manufacturing',
            href: '/ai-solutions/manufacturing',
          },
          { title: 'Medical Imaging', href: '/ai-solutions/medical-imaging' },
        ],
      },
      {
        title: 'Maps',
        href: '/maps',
        icon: <Map className='h-5 w-5' />,
        items: [
          { title: 'Map Studio', href: '/maps/studio' },
          { title: 'Products & Services', href: '/maps/products' },
        ],
      },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      {
        title: 'IAM',
        href: '/iam',
        icon: <Shield className='h-5 w-5' />,
        items: [
          { title: 'Users', href: '/iam/users' },
          { title: 'Groups', href: '/iam/groups' },
          { title: 'Roles', href: '/iam/roles' },
          { title: 'Policy', href: '/iam/policy' },
        ],
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: <Settings className='h-5 w-5' />,
        items: [
          { title: 'API Keys', href: '/settings/api-keys' },
          { title: 'MFA', href: '/settings/mfa' },
          { title: 'VS Studio Integration', href: '/settings/vs-studio' },
        ],
      },
      {
        title: 'Billing & Subscriptions',
        href: '/billing',
        icon: <CreditCard className='h-5 w-5' />,
        items: [
          { title: 'Usage Metrics', href: '/billing/usage' },
          { title: 'Transactions', href: '/billing/transactions' },
          { title: 'Pricing', href: '/billing/pricing' },
        ],
      },
    ],
  },
  {
    title: 'LEARNING RESOURCES',
    items: [
      {
        title: 'Documentation',
        href: '/documentation',
        icon: <BookOpen className='h-5 w-5' />,
        items: [
          { title: 'Docs', href: '/documentation/docs' },
          { title: 'API Reference', href: '/documentation/api' },
          { title: 'SDK Reference', href: '/documentation/sdk' },
        ],
      },
      {
        title: 'Getting Started',
        href: '/getting-started',
        icon: <GraduationCap className='h-5 w-5' />,
        items: [
          { title: 'Tutorials', href: '/getting-started/tutorials' },
          { title: 'Quickstart Guides', href: '/getting-started/quickstart' },
          { title: 'Example Projects', href: '/getting-started/examples' },
        ],
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <Sidebar>
      <SidebarHeader className='border-b'>
        <div className='flex h-16 items-center px-4'>
          <Link href='/dashboard' className='flex items-center'>
            <span className='text-xl font-bold'>Krutrim Cloud</span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigationStructure.map(category => (
          <SidebarGroup key={category.title}>
            <SidebarGroupLabel className='text-xs font-semibold text-muted-foreground tracking-wider'>
              {category.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {category.items.map(item => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      className={cn(
                        'justify-start',
                        item.items && isActive(item.href) && 'bg-accent/50'
                      )}
                    >
                      <Link href={item.href}>
                        {item.icon}
                        <span className='ml-2'>{item.title}</span>
                        {item.items && (
                          <ChevronRight className='ml-auto h-4 w-4' />
                        )}
                      </Link>
                    </SidebarMenuButton>

                    {item.items && isActive(item.href) && (
                      <div className='mt-1 ml-7 space-y-1 border-l pl-2'>
                        {item.items.map(subItem => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              'flex h-8 items-center text-sm rounded-md px-2',
                              isActive(subItem.href)
                                ? 'bg-accent text-accent-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                            )}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
