'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import type { ALBFormData } from './alb-create-form';
import type { NLBFormData } from './nlb-create-form';

interface ListenersTableProps {
  listeners: ALBFormData['listeners'] | NLBFormData['listeners'];
  onView: (listener: any) => void;
  onEdit: (listener: any) => void;
  onDelete: (listenerId: string) => void;
  isEditMode?: boolean;
  listenersEditMode?: boolean;
}

export function ListenersTable({
  listeners,
  onView,
  onEdit,
  onDelete,
  isEditMode = false,
  listenersEditMode = false,
}: ListenersTableProps) {
  return (
    <div className='rounded-md border'>
      <div className='relative w-full'>
        <table className='w-full caption-bottom' style={{ fontSize: '13px' }}>
          <thead className='[&_tr]:border-b'>
            <tr className='border-b transition-colors bg-muted hover:bg-muted/80'>
              <th className='h-10 px-4 text-left align-middle font-medium text-muted-foreground'>
                Name
              </th>
              <th className='h-10 px-4 text-left align-middle font-medium text-muted-foreground'>
                Protocol
              </th>
              <th className='h-10 px-4 text-left align-middle font-medium text-muted-foreground'>
                Target Group
              </th>
              <th className='h-10 px-4 text-right align-middle font-medium text-muted-foreground'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='[&_tr:last-child]:border-0'>
            {listeners.length > 0 ? (
              listeners.map((listener) => {
                // Get the first pool's target group and status for display
                const targetGroup = listener.pools?.[0]?.targetGroup || '—';
                const targetGroupStatus = listener.pools?.[0]?.targetGroupStatus;
                
                return (
                  <tr key={listener.id} className='border-b transition-colors bg-white hover:bg-gray-50/40'>
                    <td className='px-4 py-2 align-middle'>
                      <button
                        onClick={() => onView(listener)}
                        className='text-primary font-medium hover:underline cursor-pointer text-left focus:outline-none focus:underline'
                      >
                        {listener.name || 'Unnamed Listener'}
                      </button>
                    </td>
                    <td className='px-4 py-2 align-middle'>
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-muted text-foreground'>
                        {listener.protocol}:{listener.port}
                      </span>
                    </td>
                    <td className='px-4 py-2 align-middle'>
                      <div className='flex items-center gap-2'>
                        <span className='text-muted-foreground'>{targetGroup}</span>
                        {targetGroupStatus && <StatusBadge status={targetGroupStatus} />}
                      </div>
                    </td>
                    <td className='px-4 py-2 align-middle text-right'>
                      <div className='flex justify-end'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8 w-8 p-0'
                            >
                              <MoreVertical className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => onView(listener)}>
                              <Eye className='mr-2 h-4 w-4' />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(listener)}>
                              <Edit className='mr-2 h-4 w-4' />
                              Edit
                            </DropdownMenuItem>
                            {listeners.length > 1 && (
                              <DropdownMenuItem
                                onClick={() => onDelete(listener.id)}
                                className='text-red-600 focus:text-red-600'
                              >
                                <Trash2 className='mr-2 h-4 w-4' />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className='bg-white'>
                <td colSpan={4} className='px-4 py-12 text-center'>
                  <div className='flex flex-col items-center justify-center py-6 text-center'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      No listeners configured
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Click "Add Listener" to create one
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
