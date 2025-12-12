'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { HelpCircle, Pencil } from 'lucide-react';
import { PolicyRulesSection } from './sections/policy-rules-section';
import { PoolSection } from './sections/pool-section';
import { ShadcnDataTable } from '@/components/ui/shadcn-data-table';
import { StatusBadge } from '@/components/status-badge';
import { targetGroups, type TargetMember } from '@/lib/data';
import type { ALBFormData } from './alb-create-form';
import type { NLBFormData } from './nlb-create-form';

interface ListenerViewEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  listener: ALBFormData['listeners'][0] | NLBFormData['listeners'][0] | null;
  onSave: (listener: any) => void;
  mode: 'view' | 'edit';
  isALB?: boolean;
  isNewListener?: boolean;
}

export function ListenerViewEditModal({
  isOpen,
  onClose,
  listener: initialListener,
  onSave,
  mode: initialMode,
  isALB = true,
  isNewListener = false,
}: ListenerViewEditModalProps) {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [listener, setListener] = useState<any>(null);
  const [modalKey, setModalKey] = useState(0);

  // Reset mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Reset listener data and mode when modal opens or listener changes
  useEffect(() => {
    if (initialListener && isOpen) {
      // Create a deep copy to avoid mutating the original
      setListener(JSON.parse(JSON.stringify(initialListener)));
      // Ensure mode is set correctly when modal opens
      setMode(initialMode);
    }
  }, [initialListener, isOpen, initialMode]);

  // Cleanup effect to remove lingering portals when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Aggressive cleanup to ensure everything is removed
      const timeoutId = setTimeout(() => {
        // Remove all tooltip, menu, and listbox portals
        document.querySelectorAll('[data-radix-portal]').forEach(portal => {
          if (portal.querySelector('[role="tooltip"]') || 
              portal.querySelector('[role="menu"]') ||
              portal.querySelector('[role="listbox"]')) {
            portal.remove();
          }
        });
        
        // Remove any lingering overlays that might be blocking interaction
        document.querySelectorAll('[data-radix-dialog-overlay]').forEach(overlay => {
          if (overlay.getAttribute('data-state') === 'closed') {
            overlay.remove();
          }
        });
        
        // Ensure body is scrollable and pointer events are enabled
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  const protocolOptions = isALB
    ? [
        { value: 'HTTP', label: 'HTTP', defaultPort: 80 },
        { value: 'HTTPS', label: 'HTTPS', defaultPort: 443 },
      ]
    : [{ value: 'TCP', label: 'TCP', defaultPort: 80 }];

  const certificateOptions = [
    { value: 'cert-1', label: 'wildcard.example.com (*.example.com)' },
    { value: 'cert-2', label: 'api.example.com' },
    { value: 'cert-3', label: 'app.example.com' },
    { value: 'cert-4', label: 'staging.example.com' },
  ];

  const handleSave = () => {
    onSave(listener);
    setMode(initialMode); // Reset mode after save
    onClose();
  };

  const handleCancel = () => {
    // Reset to initial data
    if (initialListener) {
      setListener(JSON.parse(JSON.stringify(initialListener)));
    }
    
    // Determine cancel behavior based on how modal was opened:
    // 1. New listener (Add Listener button) → Close modal
    // 2. Edit from dropdown menu (table row edit) → Close modal, return to edit page
    // 3. Edit from view mode (view → edit button) → Return to view mode, keep modal open
    if (isNewListener) {
      // Scenario 1: Adding a new listener
      onClose();
    } else if (initialMode === 'edit') {
      // Scenario 2: Opened directly in edit mode from dropdown menu
      onClose();
    } else {
      // Scenario 3: Opened in view mode, then clicked edit button
      setMode('view');
    }
  };
  
  const handleClose = () => {
    // Reset mode to initial when closing
    setMode(initialMode);
    
    // Force remount on next open by incrementing key
    setModalKey(prev => prev + 1);
    
    // Immediate cleanup - don't wait
    requestAnimationFrame(() => {
      // Remove all tooltip, menu, and listbox portals
      document.querySelectorAll('[data-radix-portal]').forEach(portal => {
        if (portal.querySelector('[role="tooltip"]') || 
            portal.querySelector('[role="menu"]') ||
            portal.querySelector('[role="listbox"]')) {
          portal.remove();
        }
      });
      
      // Ensure body is interactive
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    });
    
    // Additional delayed cleanup as safety net
    setTimeout(() => {
      document.querySelectorAll('[data-radix-portal]').forEach(portal => {
        if (portal.querySelector('[role="tooltip"]') || 
            portal.querySelector('[role="menu"]') ||
            portal.querySelector('[role="listbox"]')) {
          portal.remove();
        }
      });
      
      // Remove any lingering overlays
      document.querySelectorAll('[data-radix-dialog-overlay]').forEach(overlay => {
        if (overlay.getAttribute('data-state') === 'closed') {
          overlay.remove();
        }
      });
      
      // Final ensure body is interactive
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }, 300);
    
    onClose();
  };

  const updateField = (field: string, value: any) => {
    setListener((prev: any) => ({ ...prev, [field]: value }));
  };

  const updatePoliciesAndRules = (section: string, data: any) => {
    if (section === 'policyRules') {
      setListener((prev: any) => ({
        ...prev,
        ...(data.policies && { policies: data.policies }),
        ...(data.rules && { rules: data.rules }),
      }));
    }
  };

  const updatePools = (section: string, data: any) => {
    if (section === 'pools') {
      setListener((prev: any) => ({
        ...prev,
        pools: data.pools,
      }));
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Clean up everything when component unmounts
      setTimeout(() => {
        document.querySelectorAll('[data-radix-portal]').forEach(portal => {
          if (portal.querySelector('[role="tooltip"]') || 
              portal.querySelector('[role="menu"]') ||
              portal.querySelector('[role="listbox"]')) {
            portal.remove();
          }
        });
        
        // Restore body interactivity
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }, 100);
    };
  }, []);

  // Get all registered targets from all pools (must be before early return to satisfy Rules of Hooks)
  // Handle both pool (singular from details page) and pools (plural from create/edit forms)
  const allRegisteredTargets = useMemo(() => {
    if (!listener) return [];
    
    const targets: TargetMember[] = [];
    
    // Handle singular pool (from load balancer details page)
    if ((listener as any).pool) {
      const pool = (listener as any).pool;
      if (pool.targetGroup && pool.targetGroup.trim() !== '') {
        const targetGroup = targetGroups.find(tg => tg.name === pool.targetGroup);
        if (targetGroup && targetGroup.targetMembers) {
          targets.push(...targetGroup.targetMembers);
        }
      }
    }
    
    // Handle plural pools (from create/edit forms)
    if (listener.pools && listener.pools.length > 0) {
      listener.pools.forEach((pool: any) => {
        if (pool.targetGroup && pool.targetGroup.trim() !== '') {
          const targetGroup = targetGroups.find(tg => tg.name === pool.targetGroup);
          if (targetGroup && targetGroup.targetMembers) {
            targets.push(...targetGroup.targetMembers);
          }
        }
      });
    }
    
    return targets;
  }, [listener?.pools, (listener as any)?.pool]);

  if (!listener) return null;

  const isViewMode = mode === 'view';
  const modalTitle = isNewListener 
    ? 'Add New Listener' 
    : mode === 'edit'
    ? 'Edit Listener'
    : `${listener.name || 'Unnamed Listener'} (${listener.protocol}:${listener.port})`;

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          // Immediate cleanup when closing
          document.body.style.pointerEvents = '';
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
          handleClose();
        }
      }}
    >
      <DialogContent 
        key={`listener-modal-${modalKey}`}
        className='p-0 bg-white max-w-[60vw] max-h-[85vh] w-[60vw] h-[85vh] overflow-hidden flex flex-col'
      >
        {/* Edit button - shown only in view mode */}
        {isViewMode && !isNewListener && (
          <button
            onClick={() => setMode('edit')}
            className='absolute right-14 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
            aria-label='Edit listener'
          >
            <Pencil className='h-[1.1rem] w-[1.1rem]' />
          </button>
        )}
        
        {/* Header */}
        <div className='flex-shrink-0 px-6 py-4 border-b'>
          <DialogTitle className='text-xl font-semibold'>{modalTitle}</DialogTitle>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto px-6 py-6 space-y-6'>
          {/* Listener Basic Configuration */}
          {isViewMode ? (
            <div className='space-y-3'>
              <h3 className='font-semibold text-base'>Listener Settings</h3>
              <div className='grid grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/20'>
                <div className='space-y-1'>
                  <div className='text-sm text-muted-foreground'>Listener Name</div>
                  <div className='font-medium text-sm'>{listener.name || '—'}</div>
                </div>
                <div className='space-y-1'>
                  <div className='text-sm text-muted-foreground'>Protocol</div>
                  <div className='font-medium text-sm'>{listener.protocol || '—'}</div>
                </div>
                <div className='space-y-1'>
                  <div className='text-sm text-muted-foreground'>Port</div>
                  <div className='font-medium text-sm'>{listener.port || '—'}</div>
                </div>
                {(listener.protocol === 'HTTPS' || listener.protocol === 'TERMINATED_HTTPS') && listener.certificate && (
                  <div className='space-y-1'>
                    <div className='text-sm text-muted-foreground'>SSL Certificate</div>
                    <div className='font-medium text-sm'>
                      {certificateOptions.find(cert => cert.value === listener.certificate)?.label || listener.certificate}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              <h3 className='font-medium text-base'>Listener Settings</h3>
              <div className='grid md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20'>
                {/* Listener Name */}
                <div>
                  <Label className='block mb-2 font-medium'>
                    Listener Name <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    placeholder='e.g., web-listener, api-listener'
                    value={listener.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className='focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  />
                </div>

                {/* Protocol */}
                <div>
                  <Label className='block mb-2 font-medium'>
                    Protocol <span className='text-destructive'>*</span>
                  </Label>
                  <Select
                    value={listener.protocol}
                    onValueChange={(value) => {
                      updateField('protocol', value);
                      const protocol = protocolOptions.find((p) => p.value === value);
                      if (protocol) {
                        updateField('port', protocol.defaultPort);
                      }
                    }}
                    disabled={!isNewListener}
                  >
                    <SelectTrigger className={!isNewListener ? 'bg-muted text-muted-foreground' : ''}>
                      <SelectValue placeholder='Select protocol' />
                    </SelectTrigger>
                    <SelectContent>
                      {protocolOptions.map((protocol) => (
                        <SelectItem key={protocol.value} value={protocol.value}>
                          {protocol.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!isNewListener && (
                    <p className='text-xs text-muted-foreground mt-1'>
                      Protocol cannot be changed after creation
                    </p>
                  )}
                </div>

                {/* Port */}
                <div>
                  <Label className='block mb-2 font-medium'>
                    Port <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    type='number'
                    min='1'
                    max='65535'
                    placeholder='80'
                    value={listener.port}
                    onChange={(e) =>
                      updateField('port', parseInt(e.target.value) || 80)
                    }
                    className={!isNewListener ? 'bg-muted text-muted-foreground' : 'focus:ring-2 focus:ring-ring focus:ring-offset-2'}
                    disabled={!isNewListener}
                  />
                  {!isNewListener ? (
                    <p className='text-xs text-muted-foreground mt-1'>
                      Port cannot be changed after creation
                    </p>
                  ) : (
                    <p className='text-xs text-muted-foreground mt-1'>
                      Port auto-fills based on protocol selection
                    </p>
                  )}
                </div>

                {/* Certificate */}
                {(listener.protocol === 'HTTPS' ||
                  listener.protocol === 'TERMINATED_HTTPS') && (
                  <div className='md:col-span-2'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Label className='font-medium'>
                        SSL Certificate <span className='text-destructive'>*</span>
                      </Label>
                      <TooltipWrapper
                        content='Select an SSL certificate for HTTPS listeners. The certificate must be valid and associated with your domain.'
                        side='top'
                      >
                        <HelpCircle className='h-4 w-4 text-muted-foreground hover:text-foreground cursor-help' />
                      </TooltipWrapper>
                    </div>
                    <Select
                      value={listener.certificate}
                      onValueChange={(value) => updateField('certificate', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select SSL certificate' />
                      </SelectTrigger>
                      <SelectContent>
                        {certificateOptions.map((cert) => (
                          <SelectItem key={cert.value} value={cert.value}>
                            {cert.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Policy & Rules Section (only for ALB) */}
          {isALB && (
            <div className='space-y-6'>
              <h3 className='font-semibold text-base'>Policy & Rules Configuration</h3>
              
              {isViewMode ? (
                <div className='space-y-6'>
                  {/* Policy Configuration */}
                  <div className='space-y-3'>
                    <h4 className='font-semibold text-sm'>Policy Configuration</h4>
                    {listener.policies?.map((policy: any) => (
                      <div key={policy.id} className='grid grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/20'>
                        <div className='space-y-1'>
                          <div className='text-sm text-muted-foreground'>Policy Name</div>
                          <div className='font-medium text-sm'>{policy.name || '—'}</div>
                        </div>
                        <div className='space-y-1'>
                          <div className='text-sm text-muted-foreground'>Action</div>
                          <div className='font-medium text-sm'>{policy.action || '—'}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Rule Configuration */}
                  <div className='space-y-3'>
                    <h4 className='font-semibold text-sm'>Rule Configuration</h4>
                    {listener.rules?.map((rule: any) => (
                      <div key={rule.id} className='grid grid-cols-3 gap-6 p-4 border rounded-lg bg-muted/20'>
                        <div className='space-y-1'>
                          <div className='text-sm text-muted-foreground'>Rule Type</div>
                          <div className='font-medium text-sm'>{rule.ruleType || '—'}</div>
                        </div>
                        <div className='space-y-1'>
                          <div className='text-sm text-muted-foreground'>Comparator</div>
                          <div className='font-medium text-sm'>{rule.comparator || '—'}</div>
                        </div>
                        <div className='space-y-1'>
                          <div className='text-sm text-muted-foreground'>Value</div>
                          <div className='font-medium text-sm'>{rule.value || '—'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className='border rounded-lg p-4 bg-muted/10'>
                  <PolicyRulesSection
                    formData={{
                      policies: listener.policies,
                      rules: listener.rules,
                    } as any}
                    updateFormData={updatePoliciesAndRules}
                    isSection={true}
                  />
                </div>
              )}
            </div>
          )}

          {/* Pool Section */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-base'>Pool Configuration</h3>
            {isViewMode ? (
              <div className='space-y-4'>
                {listener.pools?.map((pool: any) => (
                  <div key={pool.id}>
                    <div className='grid grid-cols-4 gap-6 p-4 border rounded-lg bg-muted/20'>
                      <div className='space-y-1'>
                        <div className='text-sm text-muted-foreground'>Pool Name</div>
                        <div className='font-medium text-sm'>{pool.name || '—'}</div>
                      </div>
                      <div className='space-y-1'>
                        <div className='text-sm text-muted-foreground'>Protocol</div>
                        <div className='font-medium text-sm'>{pool.protocol || '—'}</div>
                      </div>
                      <div className='space-y-1'>
                        <div className='text-sm text-muted-foreground'>Algorithm</div>
                        <div className='font-medium text-sm'>{pool.algorithm || '—'}</div>
                      </div>
                      <div className='space-y-1'>
                        <div className='text-sm text-muted-foreground'>Target Group</div>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium text-sm'>{pool.targetGroup || '—'}</span>
                          {pool.targetGroupStatus && <StatusBadge status={pool.targetGroupStatus} />}
                        </div>
                      </div>
                    </div>

                    {/* Target Group Health Info */}
                    {pool.targetCount !== undefined && (
                      <div className='mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                        <div className='font-semibold text-sm mb-1'>Target Group Health</div>
                        <div className='text-sm text-muted-foreground'>
                          {pool.healthyTargets || 0} of {pool.targetCount} targets are healthy
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <PoolSection
                formData={{ pools: listener.pools } as any}
                updateFormData={updatePools}
                isSection={true}
                isEditMode={true}
              />
            )}
          </div>

          {/* Registered Targets Section - Only in View Mode */}
          {isViewMode && (
            <div className='space-y-4'>
              <h3 className='font-semibold text-base'>
                Registered Targets ({allRegisteredTargets.length})
              </h3>
              {allRegisteredTargets.length > 0 ? (
              <ShadcnDataTable
                columns={[
                  {
                    key: 'name',
                    label: 'TARGET NAME',
                    sortable: true,
                    searchable: true,
                    align: 'left',
                  },
                  {
                    key: 'ipAddress',
                    label: 'IP ADDRESS',
                    sortable: true,
                    searchable: true,
                    align: 'left',
                    render: (value: string) => (
                      <span className='text-primary font-medium cursor-pointer hover:underline'>
                        {value}
                      </span>
                    ),
                  },
                  {
                    key: 'port',
                    label: 'PORT',
                    sortable: true,
                    align: 'left',
                  },
                  {
                    key: 'weight',
                    label: 'WEIGHT',
                    sortable: true,
                    align: 'left',
                  },
                  {
                    key: 'status',
                    label: 'TARGET HEALTH',
                    sortable: true,
                    align: 'left',
                    render: (value: string) => <StatusBadge status={value} />,
                  },
                ]}
                data={allRegisteredTargets}
                enableSearch={false}
                enableColumnVisibility={false}
                enablePagination={allRegisteredTargets.length > 5}
                pageSize={5}
              />
              ) : (
                <div className='p-6 border rounded-lg bg-muted/10 text-center'>
                  <p className='text-sm text-muted-foreground'>
                    No registered targets found. Please configure a target group in the pool configuration.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - only show in edit mode */}
        {!isViewMode && (
          <div className='flex-shrink-0 flex justify-end gap-4 px-6 py-4 border-t bg-muted/20'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              className='hover:bg-secondary transition-colors'
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className='bg-black text-white hover:bg-black/90'
            >
              Save
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

