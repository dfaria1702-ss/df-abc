'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ContactSupportModal } from '@/components/modals/contact-support-modal';
import {
  ServerIcon,
  CpuChipIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  MapIcon,
  CogIcon,
  XMarkIcon,
  HomeIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  CircleStackIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CubeIcon,
  GlobeAmericasIcon,
  KeyIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import {
  Settings,
  HelpCircle,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Network,
  HardDrive,
  Map,
  X,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

interface LeftNavigationProps {
  onClose: () => void;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  exactActive?: boolean;
  collapsed?: boolean;
  expanded?: string | null;
  onExpand?: (href: string) => void;
  subItems?: {
    href: string;
    label: string;
    subItems?: { href: string; label: string }[];
  }[];
  isCategory?: boolean;
  expandedSubItem?: string | null;
  onSubItemExpand?: (href: string) => void;
  expandedTertiaryItem?: string | null;
  isExternal?: boolean;
}

const navigationConfig = {
  home: {
    href: '/',
    icon: <HomeIcon className='h-[18px] w-[18px] text-[#64748b]' />,
    label: 'Home',
  },
  coreInfrastructure: {
    href: '/core-infrastructure',
    icon: <ServerIcon className='h-[18px] w-[18px] text-[#64748b]' />,
    label: 'Core Infrastructure',
    isCategory: true,
    subItems: [
      {
        href: '/compute',
        label: 'Compute',
        subItems: [
          {
            href: '/compute/vms',
            label: 'Virtual Machines',
            subItems: [
              { href: '/compute/vms/cpu', label: 'CPU VM' },
              { href: '/compute/vms/gpu', label: 'GPU VM' },
              { href: '/compute/vms/instances', label: 'My Instances' },
            ],
          },
          {
            href: '/compute/ai-pods',
            label: 'AI Pods',
            subItems: [{ href: '/compute/ai-pods/my-pods', label: 'My Pods' }],
          },
          {
            href: '/compute/auto-scaling',
            label: 'Auto Scaling Groups',
          },
          {
            href: '/compute/machines/images',
            label: 'Machine Images',
          },
          {
            href: '/compute/ssh-keys',
            label: 'SSH Keys',
          },
        ],
      },
      {
        href: '/storage',
        label: 'Storage',
        subItems: [
          {
            href: '/storage/block',
            label: 'Block Storage',
            subItems: [
              { href: '/storage/block/volumes', label: 'Volumes' },
              { href: '/storage/block/snapshots', label: 'Snapshots' },
              { href: '/storage/block/backup', label: 'Backup' },
            ],
          },
          {
            href: '/storage/object',
            label: 'Object Storage',
            subItems: [
              { href: '/storage/object/buckets', label: 'Buckets' },
              { href: '/storage/object/objects', label: 'Objects' },
              { href: '/storage/object/properties', label: 'Properties' },
            ],
          },
        ],
      },
      {
        href: '/networking',
        label: 'Networking',
        subItems: [
          { href: '/networking/vpc', label: 'VPC' },
          { href: '/networking/subnets', label: 'Subnets' },
          { href: '/networking/security-groups', label: 'Security Groups' },
          { href: '/networking/static-ips', label: 'Static IP Addresses' },
          { href: '/networking/load-balancing', label: 'Load Balancers' },
          {
            href: '/networking/dns',
            label: 'DNS',
            subItems: [
              { href: '/networking/dns', label: 'Hosted Zones' },
              { href: '/networking/dns/create', label: 'Create Zone' },
            ],
          },
        ],
      },
      {
        href: '/kubernetes',
        label: 'Kubernetes',
      },
      {
        href: '/database',
        label: 'Databases',
      },
    ],
  },
  aiStudio: {
    href: '/ai-studio',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        strokeWidth='2.2'
        stroke='currentColor'
        aria-hidden='true'
        data-slot='icon'
        className='h-[18px] w-[18px] text-[#64748b]'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25'
        ></path>
      </svg>
    ),
    label: 'AI Studio',
    isCategory: true,
    subItems: [
      {
        href: '/ai-studio/models',
        label: 'Models',
        subItems: [
          { href: '/ai-studio/models/overview', label: 'Overview' },
          { href: '/model-hub/catalog', label: 'Model Catalogue' },
          { href: '/playground/gpt-oss-20b', label: 'Playground' },
          { href: '/model-dev/fine-tuning', label: 'Fine-Tuning' },
          { href: '/models/deployment', label: 'Deployments' },
          { href: '/model-dev/evaluation', label: 'Evaluation' },
        ],
      },
    ],
  },
  aiSolutions: {
    href: '/ai-solutions',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        strokeWidth='1.6'
        stroke='currentColor'
        aria-hidden='true'
        data-slot='icon'
        className='h-[18px] w-[18px] text-[#64748b]'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z'
        ></path>
      </svg>
    ),
    label: 'AI Solutions',
    isCategory: true,
    subItems: [
      {
        href: '/ai-solutions/bhashik',
        label: 'Bhashik',
        subItems: [
          { href: '/bhashik', label: 'All Services' },
          {
            href: '/bhashik/speech-services?tab=speech',
            label: 'Speech Services',
            subItems: [
              {
                href: '/bhashik/speech-services?tab=text-to-speech',
                label: 'Text to Speech',
              },
              {
                href: '/bhashik/speech-services?tab=speech-to-text',
                label: 'Speech to Text',
              },
              {
                href: '/bhashik/speech-services?tab=speech-to-speech',
                label: 'Speech to Speech',
              },
            ],
          },
          {
            href: '/bhashik/speech-services?tab=text',
            label: 'Text Services',
            subItems: [
              {
                href: '/bhashik/text-services?tab=translation',
                label: 'Text Translation',
              },
              {
                href: '/bhashik/text-services?tab=detection',
                label: 'Language Detection',
              },
              {
                href: '/bhashik/text-services?tab=extraction',
                label: 'Extraction',
              },
              {
                href: '/bhashik/text-services?tab=sentiment',
                label: 'Sentiment Analysis',
              },
              {
                href: '/bhashik/text-services?tab=summarization',
                label: 'Summarization',
              },
            ],
          },
        ],
      },
      {
        href: '/ai-solutions/document-intelligence',
        label: 'Document Intelligence',
        subItems: [
          { href: '/doc-intelligence', label: 'All Services' },
          { href: '/playground/extract-text', label: 'Extract Text' },
          {
            href: '/playground/extract-info',
            label: 'Extract Information',
          },
          {
            href: '/playground/doc-summarization',
            label: 'Doc Summarization',
          },
          { href: '/playground/pii-masking', label: 'PII Masking' },
        ],
      },
    ],
  },
  maps: {
    href: '/maps',
    icon: <MapIcon className='h-[18px] w-[18px] text-[#64748b]' />,
    label: 'Maps',
  },
  administration: {
    href: '/administration',
    icon: <Settings className='h-[18px] w-[18px] text-[#64748b]' />,
    label: 'Administration',
    isCategory: true,
    subItems: [
      {
        href: '/billing',
        label: 'Billing',
        subItems: [
          { href: '/billing/usage', label: 'Usage' },
          { href: '/billing/transactions', label: 'Transactions' },
        ],
      },
      {
        href: '/administration/kms',
        label: 'Key Management System',
        subItems: [
          { href: '/administration/kms/storage', label: 'Storage' },
          { href: '/administration/kms/models', label: 'Models' },
          // { href: "/administration/kms/service", label: "Key Management Service" }, // Hidden temporarily
        ],
      },
      {
        href: '/administration/certificates',
        label: 'Certificate Manager',
      },
      {
        href: '/iam',
        label: 'IAM',
        subItems: [
          { href: '/iam/users', label: 'Users' },
          { href: '/iam/groups', label: 'Groups' },
          { href: '/iam/roles', label: 'Roles' },
          { href: '/iam/policies', label: 'Policies' },
        ],
      },
    ],
  },
  developertools: {
    href: '/developer',
    icon: <Code className='h-[18px] w-[18px] text-[#64748b]' />,
    label: 'Developer tools',
    isCategory: true,
    subItems: [
      {
        href: '/developer/sdks',
        label: 'SDKs',
      },
    ],
  },
  support: {
    href: '/support',
    icon: <HelpCircle className='h-[18px] w-[18px] text-muted-foreground' />,
    label: 'Support',
  },
  documentation: {
    href: 'https://krutrim-cloud.gitbook.io/krutrim-cloud-docs',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='-0.5 -0.5 24 24'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='h-[18px] w-[18px] text-muted-foreground'
        strokeWidth='1'
      >
        <path d='M14.375 1.9166666666666667H5.75a1.9166666666666667 1.9166666666666667 0 0 0 -1.9166666666666667 1.9166666666666667v15.333333333333334a1.9166666666666667 1.9166666666666667 0 0 0 1.9166666666666667 1.9166666666666667h11.5a1.9166666666666667 1.9166666666666667 0 0 0 1.9166666666666667 -1.9166666666666667V6.708333333333334Z'></path>
        <path d='M13.416666666666668 1.9166666666666667v3.8333333333333335a1.9166666666666667 1.9166666666666667 0 0 0 1.9166666666666667 1.9166666666666667h3.8333333333333335'></path>
      </svg>
    ),
    label: 'Documentation',
    isExternal: true,
  },
};

const NavItem = ({
  href,
  icon,
  label,
  active,
  exactActive,
  collapsed,
  expanded,
  onExpand,
  subItems,
  isCategory,
  expandedSubItem,
  onSubItemExpand,
  expandedTertiaryItem,
  isExternal,
}: NavItemProps) => {
  const hasSubItems = subItems && subItems.length > 0;
  const pathname = usePathname();

  const handleToggleExpand = (e: React.MouseEvent) => {
    if (hasSubItems && onExpand && !isCategory) {
      e.preventDefault();
      onExpand(href);
    }
  };

  const isSubItemActive = (subItemHref: string) => {
    return pathname.startsWith(subItemHref);
  };

  const itemContent = (
    <>
      <div className='flex min-w-[24px] items-center text-foreground/80'>
        {icon}
      </div>
      {!collapsed && (
        <>
          <span
            className={cn(
              'flex-1 truncate',
              isCategory
                ? 'text-[11px] font-semibold text-muted-foreground/70'
                : exactActive
                  ? 'text-[13px] font-medium text-foreground/90'
                  : 'text-[13px] font-medium text-foreground/60'
            )}
          >
            {label}
          </span>
          {hasSubItems && !isCategory && (
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform opacity-0 group-hover:opacity-100 text-foreground/60',
                expanded === href && 'rotate-90'
              )}
            />
          )}
        </>
      )}
    </>
  );

  if (isCategory) {
    return (
      <div className='flex flex-col'>
        <div
          className={cn(
            'flex items-center gap-1 px-3 text-[11px] font-semibold text-muted-foreground/70',
            label === 'Administration'
              ? 'pt-[18px]'
              : label === 'Core Infrastructure'
                ? 'pt-3'
                : 'pt-5'
          )}
        >
          {itemContent}
        </div>
        {!collapsed && hasSubItems && (
          <div className='ml-[1.3rem] mt-1 flex flex-col gap-0.5 space-y-0.5 relative'>
            {subItems.map((subItem, index) => (
              <div key={index} className='flex flex-col pl-4'>
                {subItem.subItems ? (
                  <button
                    onClick={() => onSubItemExpand?.(subItem.href)}
                    className={cn(
                      'group flex items-center gap-1 rounded-md px-2 py-1 text-[13px] transition-colors text-left w-full',
                      expandedSubItem === subItem.href ||
                        isSubItemActive(subItem.href)
                        ? 'text-foreground/90'
                        : 'text-foreground/60 hover:text-foreground/80 hover:bg-[#1f22250f]'
                    )}
                  >
                    <span className='flex-1'>{subItem.label}</span>
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 transition-transform opacity-0 group-hover:opacity-100 text-foreground/60',
                        expandedSubItem === subItem.href && 'rotate-90'
                      )}
                    />
                  </button>
                ) : (
                  <Link
                    href={subItem.href}
                    className={cn(
                      'group flex items-center gap-1 rounded-md px-2 py-1 text-[13px] transition-colors text-left w-full',
                      expandedSubItem === subItem.href ||
                        isSubItemActive(subItem.href)
                        ? 'text-foreground/90'
                        : 'text-foreground/60 hover:text-foreground/80 hover:bg-[#1f22250f]'
                    )}
                  >
                    <span className='flex-1'>{subItem.label}</span>
                  </Link>
                )}

                {subItem.subItems &&
                  subItem.subItems.length > 0 &&
                  expandedSubItem === subItem.href && (
                    <div className='ml-2 mt-1 flex flex-col gap-0.5 space-y-0.5 relative'>
                      {subItem.subItems.map((tertiaryItem, idx) => (
                        <Link
                          key={idx}
                          href={tertiaryItem.href}
                          className={cn(
                            'rounded-md px-2 py-1 text-[13px] transition-colors ml-4',
                            pathname === tertiaryItem.href
                              ? 'text-foreground/90'
                              : 'text-foreground/60 hover:text-foreground/80 hover:bg-[#1f22250f]'
                          )}
                        >
                          {tertiaryItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const item = hasSubItems ? (
    <button
      onClick={handleToggleExpand}
      className={cn(
        'group flex w-full items-center gap-1 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors text-left',
        exactActive
          ? 'text-foreground/90'
          : 'text-foreground/60 hover:text-foreground/80 hover:bg-[#1f22250f]'
      )}
    >
      {itemContent}
    </button>
  ) : isExternal ? (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className={cn(
        'group flex items-center gap-1 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors',
        exactActive
          ? 'text-foreground/90'
          : 'text-foreground/60 hover:text-foreground/80 hover:bg-[#1f22250f]'
      )}
    >
      {itemContent}
    </a>
  ) : (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-1 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors',
        exactActive
          ? 'text-foreground/90'
          : 'text-foreground/60 hover:text-foreground/80 hover:bg-[#1f22250f]'
      )}
    >
      {itemContent}
    </Link>
  );

  return (
    <div className='flex flex-col'>
      {collapsed ? (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>{item}</TooltipTrigger>
            <TooltipContent side='right' className='flex items-center gap-1'>
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        item
      )}

      {!collapsed && expanded && hasSubItems && (
        <div className='ml-[1.3rem] mt-1 flex flex-col gap-0.5 space-y-0.5 relative'>
          {subItems.map((subItem, index) => (
            <div key={index} className='flex flex-col pl-4'>
              <Link
                href={subItem.href}
                className={cn(
                  'rounded-md px-2 py-1 text-[13px] transition-colors',
                  pathname === subItem.href
                    ? 'text-foreground/90'
                    : 'text-foreground/60 hover:text-foreground/80 hover:bg-[#1f22250f]'
                )}
              >
                {subItem.label}
              </Link>

              {subItem.subItems &&
                subItem.subItems.length > 0 &&
                expandedTertiaryItem === subItem.href && (
                  <div className='ml-2 mt-1 flex flex-col gap-0.5 space-y-0.5 relative'>
                    {subItem.subItems.map((tertiaryItem, idx) => (
                      <Link
                        key={idx}
                        href={tertiaryItem.href}
                        className={cn(
                          'rounded-md px-2 py-1 text-[13px] transition-colors ml-4',
                          pathname === tertiaryItem.href
                            ? 'text-foreground/90'
                            : 'text-foreground/60 hover:text-foreground/80'
                        )}
                      >
                        {tertiaryItem.label}
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const navConfig = [
  {
    label: 'Networking',
    icon: <Network className='mr-2 h-4 w-4' />,
    items: [
      { label: 'VPC', href: '/networking/vpc' },
      { label: 'Subnets', href: '/networking/subnets' },
      { label: 'Security Groups', href: '/networking/security-groups' },
      { label: 'Static IP Addresses', href: '/networking/static-ips' },
      { label: 'DNS', href: '/networking/dns' },
    ],
  },
  {
    label: 'Storage',
    icon: <HardDrive className='mr-2 h-4 w-4' />,
    items: [
      { label: 'Block Storage', href: '/storage/block/volumes' },
      { label: 'Snapshots', href: '/storage/block/snapshots' },
      { label: 'Backup', href: '/storage/block/backup' },
    ],
  },
  {
    label: 'Maps',
    icon: <Map className='mr-2 h-4 w-4' />,
    items: [{ label: 'Maps', href: '/maps' }],
  },
  // Add more sections as needed
];

export function Sidebar() {
  return (
    <aside className='w-64 bg-background border-r h-full'>
      <Accordion type='multiple' className='w-full'>
        {navConfig.map(section => (
          <AccordionItem value={section.label} key={section.label}>
            <AccordionTrigger>
              {section.icon}
              {section.label}
            </AccordionTrigger>
            <AccordionContent>
              {section.items.map(item => (
                <Button
                  asChild
                  key={item.href}
                  variant='ghost'
                  className='w-full justify-start mb-1'
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </aside>
  );
}

export function LeftNavigation({ onClose }: LeftNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [expandedSubItem, setExpandedSubItem] = useState<string | null>(null);
  const [expandedTertiaryItem, setExpandedTertiaryItem] = useState<
    string | null
  >(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Determine which section should be expanded based on the current path
  useEffect(() => {
    // Keep Core Infrastructure expanded for compute-related paths
    if (pathname.startsWith('/compute')) {
      setExpandedItem('/core-infrastructure');
      setExpandedSubItem('/compute');
      if (pathname.startsWith('/compute/vms')) {
        setExpandedTertiaryItem('/compute/vms');
      }
    } else if (pathname.startsWith('/networking')) {
      setExpandedItem('/core-infrastructure');
      setExpandedSubItem('/networking');
      if (pathname.startsWith('/networking/dns')) {
        setExpandedTertiaryItem('/networking/dns');
      }
    } else if (pathname.startsWith('/storage')) {
      setExpandedItem('/core-infrastructure');
      setExpandedSubItem('/storage');
      if (pathname.startsWith('/storage/block')) {
        setExpandedTertiaryItem('/storage/block');
      } else if (pathname.startsWith('/storage/object')) {
        setExpandedTertiaryItem('/storage/object');
      }
    } else if (pathname.startsWith('/billing')) {
      setExpandedItem('/administration');
      setExpandedSubItem('/billing');
    } else if (pathname.startsWith('/administration/kms')) {
      setExpandedItem('/administration');
      setExpandedSubItem('/administration/kms');
    } else if (pathname.startsWith('/ai-studio')) {
      setExpandedItem('/ai-studio');
      if (pathname.startsWith('/ai-studio/models')) {
        setExpandedSubItem('/ai-studio/models');
      }
    } else if (
      pathname.startsWith('/ai-solutions') ||
      pathname.startsWith('/bhashik') ||
      pathname.startsWith('/doc-intelligence')
    ) {
      setExpandedItem('/ai-solutions');
      if (pathname.startsWith('/bhashik')) {
        setExpandedSubItem('/ai-solutions/bhashik');
        if (pathname.startsWith('/bhashik/text-services')) {
          setExpandedTertiaryItem('/bhashik/text-services');
        }
        if (pathname.startsWith('/bhashik/speech-services')) {
          setExpandedTertiaryItem('/bhashik/speech-services');
        }
      } else if (pathname.startsWith('/doc-intelligence')) {
        setExpandedSubItem('/ai-solutions/document-intelligence');
      }
    } else if (pathname.startsWith('/developer')) {
      setExpandedItem('/developer');
      setExpandedSubItem('/developer/sdks');
    } else if (pathname.startsWith('/administration')) {
      setExpandedItem('/administration');
    }
  }, [pathname]);

  const handleExpand = (href: string) => {
    // Don't collapse if we're in the compute section
    if (pathname.startsWith('/compute') && href === '/core-infrastructure') {
      return;
    }
    // Don't collapse if we're in the AI Studio section
    if (pathname.startsWith('/ai-studio') && href === '/ai-studio') {
      return;
    }

    const newExpandedItem = expandedItem === href ? null : href;
    setExpandedItem(newExpandedItem);

    // Auto-select first sub-item when expanding a main menu and navigate to its page
    if (newExpandedItem && href === '/core-infrastructure') {
      setExpandedSubItem('/compute');
      setExpandedTertiaryItem('/compute/vms');
      router.push('/compute/vms');
    } else if (newExpandedItem && href === '/ai-studio') {
      setExpandedSubItem('/ai-studio/models');
      router.push('/ai-studio/models');
    } else if (newExpandedItem && href === '/ai-solutions') {
      setExpandedSubItem('/ai-solutions/bhashik');
      router.push('/bhashik');
    } else if (newExpandedItem && href === '/administration') {
      setExpandedSubItem('/billing');
      router.push('/billing');
    } else if (!newExpandedItem) {
      setExpandedSubItem(null);
      setExpandedTertiaryItem(null);
    }
  };

  const handleSubItemExpand = (href: string) => {
    // Handle navigation for submenus with their own sub-items
    const wasExpanded = expandedSubItem === href;
    setExpandedSubItem(wasExpanded ? null : href);

    // If expanding (not collapsing), navigate to the first sub-item
    if (!wasExpanded) {
      if (href === '/compute') {
        setExpandedTertiaryItem('/compute/vms');
        router.push('/compute/vms');
      } else if (href === '/networking') {
        router.push('/networking/vpc');
      } else if (href === '/networking/dns') {
        router.push('/networking/dns');
      } else if (href === '/storage') {
        setExpandedTertiaryItem('/storage/block');
        router.push('/storage/block');
      } else if (href === '/billing') {
        router.push('/billing/usage');
      } else if (href === '/ai-studio/models') {
        router.push('/ai-studio/models/overview');
      } else if (href === '/ai-solutions/bhashik') {
        router.push('/bhashik');
      } else if (href === '/ai-solutions/document-intelligence') {
        router.push('/doc-intelligence');
      } else if (href === '/bhashik/text-services') {
        router.push('/bhashik/speech-services?tab=text');
      } else if (href === '/bhashik/speech-services') {
        router.push('/bhashik/speech-services?tab=speech');
      } else if (href === '/administration/kms') {
        router.push('/administration/kms/storage');
      } else if (href === '/developer/sdks') {
        router.push('/developer/sdks');
      }
    } else {
      // If collapsing, clear tertiary expansion
      setExpandedTertiaryItem(null);
    }

    // Don't collapse VMs submenu when in VMs section
    if (pathname.startsWith('/compute/vms') && href === '/compute/vms') {
      setExpandedSubItem('/compute');
      setExpandedTertiaryItem('/compute/vms');
      return;
    }
    // Don't collapse storage submenu when in storage section
    if (pathname.startsWith('/storage') && href === '/storage') {
      setExpandedSubItem('/storage');
      return;
    }
    // Don't collapse Models submenu when in AI Studio models section
    if (pathname.startsWith('/ai-studio/models') && href === '/ai-studio/models') {
      setExpandedSubItem('/ai-studio/models');
      return;
    }
  };

  const isActive = (path: string) => {
    // Normalize Bhashik services links that include query params
    if (path.startsWith('/bhashik/speech-services')) {
      return pathname.startsWith('/bhashik/speech-services');
    }
    // For Home menu item, consider both root path and dashboard path as active
    if (path === '/') {
      return pathname === '/' || pathname === '/dashboard';
    }
    // For sections, check if path starts with the given path
    if (path === '/compute') {
      return pathname.startsWith('/compute');
    }
    if (path === '/networking') {
      return pathname.startsWith('/networking');
    }
    if (path === '/networking/dns') {
      return pathname.startsWith('/networking/dns');
    }
    if (path === '/developer') {
      return pathname.startsWith('/developer');
    }
    if (path === '/developer/sdks') {
      return pathname.startsWith('/developer/sdks');
    }
    if (path === '/storage') {
      return pathname.startsWith('/storage');
    }
    if (path === '/billing') {
      return pathname.startsWith('/billing');
    }
    if (path === '/compute/vms') {
      return pathname.startsWith('/compute/vms');
    }
    if (path === '/storage/block') {
      return pathname.startsWith('/storage/block');
    }
    if (path === '/storage/object') {
      return pathname.startsWith('/storage/object');
    }
    if (path === '/ai-solutions/bhashik') {
      return pathname.startsWith('/bhashik');
    }
    if (path === '/ai-solutions/document-intelligence') {
      return pathname.startsWith('/doc-intelligence');
    }
    if (path === '/bhashik/text-services') {
      return pathname.startsWith('/bhashik/text-services');
    }
    if (path === '/bhashik/speech-services') {
      return pathname.startsWith('/bhashik/speech-services');
    }
    return pathname === path;
  };

  const isExactActive = (path: string) => {
    // For Home menu item, consider both root path and dashboard path as active
    if (path === '/') {
      return pathname === '/' || pathname === '/dashboard';
    }
    // For compute section, check if path starts with the given path
    if (path === '/compute') {
      return pathname === '/compute';
    }
    if (path === '/compute/vms') {
      return pathname === '/compute/vms';
    }
    return pathname === path;
  };

  return (
    <div className='flex h-screen flex-col'>
      {/* Mobile close button - only visible on mobile */}
      <div className='flex items-center justify-end px-4 py-2 lg:hidden'>
        <Button variant='ghost' size='icon' onClick={onClose}>
          <X className='h-4 w-4' />
        </Button>
      </div>

      {/* Main navigation items */}
      <div className='flex-1 overflow-y-auto pb-3 px-3'>
        <div className='flex flex-col gap-[1px]'>
          {/* Home */}
          <NavItem
            href={navigationConfig.home.href}
            icon={navigationConfig.home.icon}
            label={navigationConfig.home.label}
            exactActive={isExactActive(navigationConfig.home.href)}
            active={isActive(navigationConfig.home.href)}
          />

          {/* Core Infrastructure */}
          <NavItem
            href={navigationConfig.coreInfrastructure.href}
            icon={navigationConfig.coreInfrastructure.icon}
            label={navigationConfig.coreInfrastructure.label}
            exactActive={isExactActive(
              navigationConfig.coreInfrastructure.href
            )}
            active={isActive(navigationConfig.coreInfrastructure.href)}
            expanded={expandedItem}
            onExpand={handleExpand}
            subItems={navigationConfig.coreInfrastructure.subItems}
            isCategory={navigationConfig.coreInfrastructure.isCategory}
            expandedSubItem={expandedSubItem}
            onSubItemExpand={handleSubItemExpand}
            expandedTertiaryItem={expandedTertiaryItem}
          />

          {/* AI Studio */}
          <NavItem
            href={navigationConfig.aiStudio.href}
            icon={navigationConfig.aiStudio.icon}
            label={navigationConfig.aiStudio.label}
            exactActive={isExactActive(navigationConfig.aiStudio.href)}
            active={isActive(navigationConfig.aiStudio.href)}
            expanded={expandedItem}
            onExpand={handleExpand}
            subItems={navigationConfig.aiStudio.subItems}
            isCategory={navigationConfig.aiStudio.isCategory}
            expandedSubItem={expandedSubItem}
            onSubItemExpand={handleSubItemExpand}
            expandedTertiaryItem={expandedTertiaryItem}
          />

          {/* AI Solutions */}
          <NavItem
            href={navigationConfig.aiSolutions.href}
            icon={navigationConfig.aiSolutions.icon}
            label={navigationConfig.aiSolutions.label}
            exactActive={isExactActive(navigationConfig.aiSolutions.href)}
            active={isActive(navigationConfig.aiSolutions.href)}
            expanded={expandedItem}
            onExpand={handleExpand}
            subItems={navigationConfig.aiSolutions.subItems}
            isCategory={navigationConfig.aiSolutions.isCategory}
            expandedSubItem={expandedSubItem}
            onSubItemExpand={handleSubItemExpand}
            expandedTertiaryItem={expandedTertiaryItem}
          />

          {/* Maps */}
          <div className='mt-[10px]'>
            <NavItem
              href={navigationConfig.maps.href}
              icon={navigationConfig.maps.icon}
              label={navigationConfig.maps.label}
              exactActive={isExactActive(navigationConfig.maps.href)}
              active={isActive(navigationConfig.maps.href)}
            />
          </div>

          {/* Administration */}
          <NavItem
            href={navigationConfig.administration.href}
            icon={navigationConfig.administration.icon}
            label={navigationConfig.administration.label}
            exactActive={isExactActive(navigationConfig.administration.href)}
            active={isActive(navigationConfig.administration.href)}
            expanded={expandedItem}
            onExpand={handleExpand}
            subItems={navigationConfig.administration.subItems}
            isCategory={navigationConfig.administration.isCategory}
            expandedSubItem={expandedSubItem}
            onSubItemExpand={handleSubItemExpand}
            expandedTertiaryItem={expandedTertiaryItem}
          />

          {/* Developer tools */}
          <NavItem
            href={navigationConfig.developertools.href}
            icon={navigationConfig.developertools.icon}
            label={navigationConfig.developertools.label}
            exactActive={isExactActive(navigationConfig.developertools.href)}
            active={isActive(navigationConfig.developertools.href)}
            expanded={expandedItem}
            onExpand={handleExpand}
            subItems={navigationConfig.developertools.subItems}
            isCategory={navigationConfig.developertools.isCategory}
            expandedSubItem={expandedSubItem}
            onSubItemExpand={handleSubItemExpand}
            expandedTertiaryItem={expandedTertiaryItem}
          />
        </div>
      </div>

      {/* Bottom navigation items */}
      <div className='mt-auto px-3'>
        {/* Contact Support */}
        <div className='pb-3 pt-4 border-b border-border/40'>
          <button 
            onClick={() => setIsContactModalOpen(true)}
            className='text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 px-2 text-left w-full cursor-pointer'
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" className="flex-shrink-0">
              <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" stroke="currentColor">
                <path d="M5.486,7.688c.379-1.016,1.187-1.823,2.203-2.203"></path>
                <path d="M10.312,5.486c1.016,.379,1.823,1.187,2.203,2.203"></path>
                <path d="M12.514,10.312c-.379,1.016-1.187,1.823-2.203,2.203"></path>
                <path d="M7.688,12.514c-1.016-.379-1.823-1.187-2.203-2.203"></path>
                <path d="M6.464,15.794c-1.964-.733-3.525-2.294-4.259-4.259"></path>
                <path d="M15.794,11.536c-.733,1.964-2.295,3.525-4.259,4.259"></path>
                <path d="M11.536,2.206c1.964,.733,3.525,2.295,4.259,4.259"></path>
                <path d="M2.206,6.464c.733-1.964,2.294-3.525,4.259-4.259"></path>
                <path d="M10.311,5.487l1.399-3.749h0c-.844-.315-1.757-.487-2.711-.487-.954,0-1.867,.172-2.711,.487l1.399,3.749c.409-.153,.849-.236,1.311-.236s.903,.084,1.311,.237Z"></path>
                <path d="M12.513,10.311l3.749,1.399h0c.315-.844,.487-1.757,.487-2.71,0-.954-.172-1.867-.487-2.711l-3.749,1.399c.153,.409,.236,.849,.236,1.311s-.084,.903-.237,1.311Z"></path>
                <path d="M7.689,12.513l-1.399,3.749h0c.844,.315,1.757,.487,2.711,.487,.954,0,1.867-.172,2.711-.487l-1.399-3.749c-.409,.153-.849,.236-1.311,.236s-.903-.084-1.311-.237Z"></path>
                <path d="M5.487,7.689l-3.749-1.399h0c-.315,.844-.487,1.757-.487,2.71,0,.954,.172,1.867,.487,2.711l3.749-1.399c-.153-.409-.236-.849-.236-1.311s.084-.903,.237-1.311Z"></path>
              </g>
            </svg>
            Contact Support
          </button>
        </div>
        
        <div className='py-3 flex flex-col gap-1'>
          {/* Documentation */}
          <NavItem
            href={navigationConfig.documentation.href}
            icon={navigationConfig.documentation.icon}
            label={navigationConfig.documentation.label}
            exactActive={isExactActive(navigationConfig.documentation.href)}
            active={isActive(navigationConfig.documentation.href)}
            isExternal={navigationConfig.documentation.isExternal}
          />

          {/* Support */}
          <NavItem
            href={navigationConfig.support.href}
            icon={navigationConfig.support.icon}
            label={navigationConfig.support.label}
            exactActive={isExactActive(navigationConfig.support.href)}
            active={isActive(navigationConfig.support.href)}
          />
        </div>
        {/* Extra spacing at bottom */}
        <div className='pb-2'></div>
      </div>

      {/* Contact Support Modal */}
      <ContactSupportModal
        open={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}

export default LeftNavigation;
