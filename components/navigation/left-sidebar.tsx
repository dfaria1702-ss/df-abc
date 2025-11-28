'use client';

import type React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Brain,
  Code,
  Briefcase,
  Database,
  Server,
  Shield,
  CreditCard,
  Settings,
  FileText,
  BarChart3,
  Cpu,
  FlaskRoundIcon as Flask,
  LineChart,
  Box,
  PackageIcon as PipelineIcon,
  Zap,
  Network,
  Key,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  items?: NavSubItem[];
}

interface NavSubItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavCategory {
  title: string;
  items: NavItem[];
}

const navigationStructure: NavCategory[] = [
  {
    title: 'MAIN',
    items: [
      {
        title: 'Home',
        href: '/dashboard',
        icon: <LayoutDashboard className='h-5 w-5' />,
      },
    ],
  },
  {
    title: 'AI COMPUTE & INFRASTRUCTURE',
    items: [
      {
        title: 'Compute Resources',
        href: '/compute/resources',
        icon: <Cpu className='h-5 w-5' />,
        items: [
          { title: 'GPU Resources', href: '/compute/resources/gpu' },
          { title: 'CPU Resources', href: '/compute/resources/cpu' },
          { title: 'TPU Resources', href: '/compute/resources/tpu' },
        ],
      },
      {
        title: 'AI Pods',
        href: '/compute/pods',
        icon: <Flask className='h-5 w-5' />,
      },
      {
        title: 'Performance Monitoring',
        href: '/compute/monitoring',
        icon: <LineChart className='h-5 w-5' />,
      },
      {
        title: 'Networking',
        href: '/compute/networking',
        icon: <Network className='h-5 w-5' />,
      },
      {
        title: 'SSH Keys',
        href: '/compute/ssh-keys',
        icon: <Key className='h-5 w-5' />,
      },
      {
        title: 'Kubernetes Clusters',
        href: '/compute/kubernetes',
        icon: <Server className='h-5 w-5' />,
      },
    ],
  },
  {
    title: 'AI MODEL TRAINING & DEPLOYMENT',
    items: [
      {
        title: 'Model Library',
        href: '/models/library',
        icon: <Brain className='h-5 w-5' />,
      },
      {
        title: 'Model Training',
        href: '/models/training',
        icon: <BarChart3 className='h-5 w-5' />,
      },
      {
        title: 'Model Deployment',
        href: '/models/deployment',
        icon: <Zap className='h-5 w-5' />,
      },
      {
        title: 'Model Monitoring',
        href: '/models/monitoring',
        icon: <LineChart className='h-5 w-5' />,
      },
    ],
  },
  {
    title: 'AI STORAGE & DATA SOLUTIONS',
    items: [
      {
        title: 'Datasets',
        href: '/data/datasets',
        icon: <Database className='h-5 w-5' />,
      },
      {
        title: 'Object Storage',
        href: '/data/storage',
        icon: <Box className='h-5 w-5' />,
      },
      {
        title: 'Data Pipelines',
        href: '/data/pipelines',
        icon: <PipelineIcon className='h-5 w-5' />,
      },
      {
        title: 'Data Governance',
        href: '/data/governance',
        icon: <Shield className='h-5 w-5' />,
      },
    ],
  },
  {
    title: 'AI APIS & INDUSTRY SOLUTIONS',
    items: [
      {
        title: 'API Catalog',
        href: '/apis/catalog',
        icon: <Code className='h-5 w-5' />,
      },
      {
        title: 'API Management',
        href: '/apis/management',
        icon: <Settings className='h-5 w-5' />,
      },
      {
        title: 'Industry Solutions',
        href: '/solutions',
        icon: <Briefcase className='h-5 w-5' />,
        items: [
          { title: 'Healthcare', href: '/solutions/healthcare' },
          { title: 'Financial Services', href: '/solutions/finance' },
          { title: 'Retail & E-commerce', href: '/solutions/retail' },
          { title: 'Manufacturing', href: '/solutions/manufacturing' },
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
          { title: 'Policies', href: '/iam/policies' },
        ],
      },
      {
        title: 'Billing & Administration',
        href: '/billing',
        icon: <CreditCard className='h-5 w-5' />,
      },
      {
        title: 'Docs & Developer Resources',
        href: '/support',
        icon: <FileText className='h-5 w-5' />,
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: <Settings className='h-5 w-5' />,
      },
    ],
  },
];

interface LeftSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function LeftSidebar({ collapsed = false, onToggle }: LeftSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  // Auto-expand the section that contains the current path
  useEffect(() => {
    const newExpandedItems: Record<string, boolean> = {};

    navigationStructure.forEach(category => {
      category.items.forEach(item => {
        if (
          item.items &&
          (pathname === item.href ||
            item.items.some(subItem => pathname.startsWith(subItem.href)))
        ) {
          newExpandedItems[item.href] = true;
        }
      });
    });

    setExpandedItems(prev => ({ ...prev, ...newExpandedItems }));
  }, [pathname]);

  const toggleExpand = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedItems(prev => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div
      className={cn(
        'h-screen border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className='flex h-16 items-center border-b px-4'>
        <Link href='/dashboard' className='flex items-center'>
          {collapsed ? (
            <div className='h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold'>
              K
            </div>
          ) : (
            <span className='text-xl font-bold'>Krutrim Cloud</span>
          )}
        </Link>
      </div>

      <ScrollArea className='h-[calc(100vh-4rem)]'>
        <div className='py-2'>
          {navigationStructure.map(category => (
            <div key={category.title} className='mb-4'>
              {!collapsed && (
                <h3 className='px-4 py-1 text-xs font-semibold text-muted-foreground tracking-wider'>
                  {category.title}
                </h3>
              )}
              <div className='space-y-1 mt-1'>
                {category.items.map(item => (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex h-9 items-center text-sm font-medium rounded-none relative',
                        isActive(item.href) &&
                          (!item.items ||
                            !item.items.some(
                              subItem =>
                                pathname.startsWith(subItem.href) &&
                                subItem.href !== item.href
                            ))
                          ? 'bg-krutrim-green/10 text-krutrim-green'
                          : 'hover:bg-accent/20 text-foreground',
                        collapsed && 'justify-center px-0'
                      )}
                      onClick={e =>
                        item.items && !collapsed && toggleExpand(item.href, e)
                      }
                    >
                      {/* Active indicator line positioned to align with icon center */}
                      {isActive(item.href) &&
                        (!item.items ||
                          !item.items.some(
                            subItem =>
                              pathname.startsWith(subItem.href) &&
                              subItem.href !== item.href
                          )) && (
                          <div className='absolute left-[1.75rem] top-0 bottom-0 w-0.5 bg-krutrim-green -translate-x-1/2' />
                        )}
                      <span className='flex h-5 w-5 items-center justify-center ml-4'>
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <>
                          <span className='ml-3 truncate'>{item.title}</span>
                          {item.items && (
                            <span className='ml-auto'>
                              {expandedItems[item.href] ? (
                                <ChevronDown className='h-4 w-4' />
                              ) : (
                                <ChevronRight className='h-4 w-4' />
                              )}
                            </span>
                          )}
                        </>
                      )}
                    </Link>

                    {!collapsed && item.items && expandedItems[item.href] && (
                      <div className='ml-9 mt-1 space-y-1'>
                        {item.items.map(subItem => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              'flex h-8 items-center text-sm rounded-none relative',
                              isActive(subItem.href)
                                ? 'text-primary font-medium'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {/* Active indicator line positioned to align with text */}
                            {isActive(subItem.href) && (
                              <div className='absolute left-[2.75rem] top-0 bottom-0 w-0.5 bg-primary -translate-x-1/2' />
                            )}
                            <span className='pl-[2.5rem]'>{subItem.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
