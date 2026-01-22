'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ArrowUpRight,
  AlertTriangle,
  Network,
  Copy,
  Settings,
  Plus,
  FolderDown,
  CameraIcon,
  Download,
  Square,
  RotateCcw,
  Image,
  RefreshCw,
  HardDrive,
  Shield,
  Wifi,
  BarChart3,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { TooltipWrapper } from './ui/tooltip-wrapper';
import Link from 'next/link';
import { DeleteConfirmationModal } from './delete-confirmation-modal';

interface CustomAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

interface ActionMenuProps {
  viewHref?: string;
  viewLabel?: string; // Custom label for view action
  editHref?: string;
  deleteHref?: string;
  resourceName?: string;
  resourceType?: string;
  onExtend?: () => void;
  onWarning?: () => void;
  onEdit?: () => void;
  onCustomDelete?: () => void; // New prop for custom delete handling
  onConnectSubnet?: () => void; // New prop for subnet connections
  deleteLabel?: string; // Custom label for delete action
  onCopyURL?: () => void; // New prop for copy URL action
  onEditBucket?: () => void; // New prop for edit bucket action
  onAddRule?: () => void; // Deprecated, use onCreateInstantBackup for backup action
  onCreateInstantBackup?: () => void; // For instant backup action
  onCreateInstantSnapshot?: () => void; // For instant snapshot action
  onRestore?: () => void; // New prop for restore backup action
  onDownload?: () => void; // New prop for download action
  // New VM-specific actions
  onStop?: () => void; // For stopping VMs
  onRestart?: () => void; // For restarting VMs
  onCreateImage?: () => void; // For creating machine images
  onReboot?: () => void; // For rebooting VMs
  // New VM management actions for instance attachment/detachment
  onAttachDetachVolumes?: () => void; // For volume management
  onAttachDetachSecurityGroups?: () => void; // For security group management
  onAttachDetachPublicIP?: () => void; // For IP address management
  onRetry?: () => void; // For retry action (e.g., failed volumes)
  customActions?: CustomAction[]; // New prop for custom actions
  metricsHref?: string; // New prop for metrics navigation
}

/**
 * @component ActionMenu
 * @description A dropdown menu for common actions like view, edit, and delete
 * @status Active
 * @example
 * <ActionMenu
 *   viewHref="/resources/123"
 *   editHref="/resources/123/edit"
 *   deleteHref="/resources/123/delete"
 *   resourceName="example-resource"
 *   resourceType="Resource"
 * />
 */
export function ActionMenu({
  viewHref,
  viewLabel = 'View',
  editHref,
  deleteHref,
  resourceName = 'this resource',
  resourceType = 'Resource',
  onExtend,
  onWarning,
  onEdit,
  onCustomDelete,
  onConnectSubnet,
  deleteLabel = 'Delete',
  onCopyURL,
  onEditBucket,
  onAddRule,
  onCreateInstantBackup,
  onCreateInstantSnapshot,
  onRestore,
  onDownload,
  onStop,
  onRestart,
  onCreateImage,
  onReboot,
  onAttachDetachVolumes,
  onAttachDetachSecurityGroups,
  onAttachDetachPublicIP,
  onRetry,
  customActions = [],
  metricsHref,
}: ActionMenuProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  const handleDelete = () => {
    if (deleteHref) {
      router.push(deleteHref);
    }
  };

  return (
    <>
      <DropdownMenu>
        <TooltipWrapper content={`More actions for ${resourceName}`}>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='rounded-full'>
              <MoreVertical className='h-5 w-5' />
              <span className='sr-only'>Open menu</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipWrapper>
        <DropdownMenuContent
          align='end'
          className='border-border min-w-[180px]'
        >
          {viewHref && (
            <DropdownMenuItem asChild>
              <Link
                href={viewHref}
                className='flex items-center cursor-pointer'
              >
                <Eye className='mr-2 h-4 w-4' />
                <span>{viewLabel}</span>
              </Link>
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem
              onClick={onEdit}
              className='flex items-center cursor-pointer'
            >
              <Edit className='mr-2 h-4 w-4' />
              <span>Edit</span>
            </DropdownMenuItem>
          )}
          {editHref && (
            <DropdownMenuItem asChild>
              <Link
                href={editHref}
                className='flex items-center cursor-pointer'
              >
                <Edit className='mr-2 h-4 w-4' />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
          )}
          {onCopyURL && (
            <DropdownMenuItem
              onClick={onCopyURL}
              className='flex items-center cursor-pointer'
            >
              <Copy className='mr-2 h-4 w-4' />
              <span>Copy URL</span>
            </DropdownMenuItem>
          )}
          {onEditBucket && (
            <DropdownMenuItem
              onClick={onEditBucket}
              className='flex items-center cursor-pointer'
            >
              <Settings className='mr-2 h-4 w-4' />
              <span>Edit Bucket</span>
            </DropdownMenuItem>
          )}
          {onStop && (
            <DropdownMenuItem
              onClick={onStop}
              className='flex items-center cursor-pointer'
            >
              <Square className='mr-2 h-4 w-4' />
              <span>Stop Machine</span>
            </DropdownMenuItem>
          )}
          {onRestart && (
            <DropdownMenuItem
              onClick={onRestart}
              className='flex items-center cursor-pointer'
            >
              <RotateCcw className='mr-2 h-4 w-4' />
              <span>Restart Machine</span>
            </DropdownMenuItem>
          )}
          {onReboot && (
            <DropdownMenuItem
              onClick={onReboot}
              className='flex items-center cursor-pointer'
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              <span>Reboot Machine</span>
            </DropdownMenuItem>
          )}
          {onCreateImage && (
            <DropdownMenuItem
              onClick={onCreateImage}
              className='flex items-center cursor-pointer'
            >
              <Image className='mr-2 h-4 w-4' />
              <span>Create Machine Image</span>
            </DropdownMenuItem>
          )}
          {onAttachDetachVolumes && (
            <DropdownMenuItem
              onClick={onAttachDetachVolumes}
              className='flex items-center cursor-pointer'
            >
              <HardDrive className='mr-2 h-4 w-4' />
              <span>Attach/Detach Volumes</span>
            </DropdownMenuItem>
          )}
          {onAttachDetachSecurityGroups && (
            <DropdownMenuItem
              onClick={onAttachDetachSecurityGroups}
              className='flex items-center cursor-pointer'
            >
              <Shield className='mr-2 h-4 w-4' />
              <span>Attach/Detach Security Groups</span>
            </DropdownMenuItem>
          )}
          {onAttachDetachPublicIP && (
            <DropdownMenuItem
              onClick={onAttachDetachPublicIP}
              className='flex items-center cursor-pointer'
            >
              <Wifi className='mr-2 h-4 w-4' />
              <span>Attach/Detach Public IP</span>
            </DropdownMenuItem>
          )}
          {onCreateInstantBackup && (
            <DropdownMenuItem
              onClick={onCreateInstantBackup}
              className='flex items-center cursor-pointer'
            >
              <FolderDown className='mr-2 h-4 w-4' />
              <span>Create Instant Backup</span>
            </DropdownMenuItem>
          )}
          {onCreateInstantSnapshot && (
            <DropdownMenuItem
              onClick={onCreateInstantSnapshot}
              className='flex items-center cursor-pointer'
            >
              <CameraIcon className='mr-2 h-4 w-4' />
              <span>Create Instant Snapshot</span>
            </DropdownMenuItem>
          )}
          {onRetry && (
            <DropdownMenuItem
              onClick={onRetry}
              className='flex items-center cursor-pointer'
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              <span>Retry</span>
            </DropdownMenuItem>
          )}
          {onExtend && (
            <DropdownMenuItem
              onClick={onExtend}
              className='flex items-center cursor-pointer'
            >
              <ArrowUpRight className='mr-2 h-4 w-4' />
              <span>Extend Volume</span>
            </DropdownMenuItem>
          )}
          {onWarning && (
            <DropdownMenuItem
              onClick={onWarning}
              className='flex items-center cursor-pointer'
            >
              <AlertTriangle className='mr-2 h-4 w-4 text-yellow-600' />
              <span>VM Warning</span>
            </DropdownMenuItem>
          )}
          {onConnectSubnet && (
            <DropdownMenuItem
              onClick={onConnectSubnet}
              className='flex items-center cursor-pointer'
            >
              <Network className='mr-2 h-4 w-4' />
              <span>Connect/Disconnect Subnet</span>
            </DropdownMenuItem>
          )}
          {onRestore && (
            <DropdownMenuItem
              onClick={onRestore}
              className='flex items-center cursor-pointer'
            >
              <ArrowUpRight className='mr-2 h-4 w-4' />
              <span>Restore</span>
            </DropdownMenuItem>
          )}
          {onDownload && (
            <DropdownMenuItem
              onClick={onDownload}
              className='flex items-center cursor-pointer'
            >
              <Download className='mr-2 h-4 w-4' />
              <span>Download</span>
            </DropdownMenuItem>
          )}
          {metricsHref && (
            <DropdownMenuItem asChild>
              <Link
                href={metricsHref}
                className='flex items-center cursor-pointer'
              >
                <BarChart3 className='mr-2 h-4 w-4' />
                <span>View Metrics</span>
              </Link>
            </DropdownMenuItem>
          )}
          {customActions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={action.onClick}
              className={`flex items-center cursor-pointer ${
                action.variant === 'destructive'
                  ? 'text-destructive focus:text-destructive'
                  : ''
              }`}
            >
              {action.icon || <RefreshCw className='mr-2 h-4 w-4' />}
              <span>{action.label}</span>
            </DropdownMenuItem>
          ))}
          {(deleteHref || onCustomDelete) && (
            <DropdownMenuItem
              onClick={() => {
                if (onCustomDelete) {
                  onCustomDelete();
                } else {
                  setIsDeleteModalOpen(true);
                }
              }}
              className='flex items-center text-destructive focus:text-destructive cursor-pointer'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              <span>{deleteLabel}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {deleteHref && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          resourceName={resourceName}
          resourceType={resourceType}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
