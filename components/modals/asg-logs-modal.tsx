'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { useToast } from '@/hooks/use-toast';

interface ASGEvent {
  event_id: string;
  event_type: string;
  event_status: string;
  timestamp: string;
  message: string;
}

interface ASGLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  asgName: string;
}

export function ASGLogsModal({ isOpen, onClose, asgName }: ASGLogsModalProps) {
  const { toast } = useToast();

  // Mock events with more instances
  const events: ASGEvent[] = [
    {
      event_id: 'evt-7f3a91',
      event_type: 'SCALE_OUT',
      event_status: 'STARTED',
      timestamp: '2026-01-05T10:32:15Z',
      message: 'Scale-out initiated due to CPU threshold breach',
    },
    {
      event_id: 'evt-8b4c22',
      event_type: 'SCALE_OUT',
      event_status: 'IN_PROGRESS',
      timestamp: '2026-01-05T10:33:42Z',
      message: 'Launching new instance media-processing-asg-05',
    },
    {
      event_id: 'evt-9d5e33',
      event_type: 'SCALE_OUT',
      event_status: 'COMPLETED',
      timestamp: '2026-01-05T10:35:18Z',
      message: 'Successfully launched instance media-processing-asg-05',
    },
    {
      event_id: 'evt-1a6f44',
      event_type: 'HEALTH_CHECK',
      event_status: 'COMPLETED',
      timestamp: '2026-01-05T11:15:30Z',
      message: 'Health check passed for all instances',
    },
    {
      event_id: 'evt-2b7g55',
      event_type: 'SCALE_IN',
      event_status: 'STARTED',
      timestamp: '2026-01-05T14:22:05Z',
      message: 'Scale-in initiated due to low CPU utilization',
    },
    {
      event_id: 'evt-3c8h66',
      event_type: 'SCALE_IN',
      event_status: 'IN_PROGRESS',
      timestamp: '2026-01-05T14:23:11Z',
      message: 'Terminating instance media-processing-asg-03',
    },
    {
      event_id: 'evt-4d9i77',
      event_type: 'SCALE_IN',
      event_status: 'COMPLETED',
      timestamp: '2026-01-05T14:25:47Z',
      message: 'Successfully terminated instance media-processing-asg-03',
    },
    {
      event_id: 'evt-5e0j88',
      event_type: 'HEALTH_CHECK',
      event_status: 'FAILED',
      timestamp: '2026-01-05T16:10:22Z',
      message: 'Health check failed for instance media-processing-asg-02',
    },
    {
      event_id: 'evt-6f1k99',
      event_type: 'INSTANCE_REPLACE',
      event_status: 'STARTED',
      timestamp: '2026-01-05T16:11:35Z',
      message: 'Initiating replacement for unhealthy instance',
    },
    {
      event_id: 'evt-7g2la0',
      event_type: 'INSTANCE_REPLACE',
      event_status: 'IN_PROGRESS',
      timestamp: '2026-01-05T16:12:58Z',
      message: 'Terminating unhealthy instance media-processing-asg-02',
    },
    {
      event_id: 'evt-8h3mb1',
      event_type: 'INSTANCE_REPLACE',
      event_status: 'IN_PROGRESS',
      timestamp: '2026-01-05T16:14:21Z',
      message: 'Launching replacement instance media-processing-asg-06',
    },
    {
      event_id: 'evt-9i4nc2',
      event_type: 'INSTANCE_REPLACE',
      event_status: 'COMPLETED',
      timestamp: '2026-01-05T16:16:45Z',
      message: 'Successfully replaced instance media-processing-asg-02',
    },
    {
      event_id: 'evt-0j5od3',
      event_type: 'SCHEDULED_ACTION',
      event_status: 'COMPLETED',
      timestamp: '2026-01-05T22:00:00Z',
      message: 'Nightly scale down completed - set desired capacity to 2',
    },
    {
      event_id: 'evt-1k6pe4',
      event_type: 'SCALE_OUT',
      event_status: 'STARTED',
      timestamp: '2026-01-06T09:00:15Z',
      message: 'Morning scale-up initiated via scheduled action',
    },
    {
      event_id: 'evt-2l7qf5',
      event_type: 'SCALE_OUT',
      event_status: 'COMPLETED',
      timestamp: '2026-01-06T09:03:42Z',
      message: 'Scaled to desired capacity of 4 instances',
    },
    {
      event_id: 'evt-3m8rg6',
      event_type: 'HEALTH_CHECK',
      event_status: 'COMPLETED',
      timestamp: '2026-01-06T12:30:00Z',
      message: 'Periodic health check completed - all instances healthy',
    },
    {
      event_id: 'evt-4n9sh7',
      event_type: 'SCALE_OUT',
      event_status: 'STARTED',
      timestamp: '2026-01-06T15:45:22Z',
      message: 'Scale-out triggered by memory utilization exceeding 80%',
    },
    {
      event_id: 'evt-5o0ti8',
      event_type: 'SCALE_OUT',
      event_status: 'IN_PROGRESS',
      timestamp: '2026-01-06T15:46:35Z',
      message: 'Provisioning instance media-processing-asg-07',
    },
    {
      event_id: 'evt-6p1uj9',
      event_type: 'SCALE_OUT',
      event_status: 'COMPLETED',
      timestamp: '2026-01-06T15:49:12Z',
      message: 'Instance media-processing-asg-07 launched and healthy',
    },
    {
      event_id: 'evt-7q2vk0',
      event_type: 'SCALE_OUT',
      event_status: 'STARTED',
      timestamp: '2026-01-06T16:12:08Z',
      message: 'Additional scale-out required - CPU at 85%',
    },
    {
      event_id: 'evt-8r3wl1',
      event_type: 'SCALE_OUT',
      event_status: 'IN_PROGRESS',
      timestamp: '2026-01-06T16:13:45Z',
      message: 'Starting instance media-processing-asg-08',
    },
    {
      event_id: 'evt-9s4xm2',
      event_type: 'SCALE_OUT',
      event_status: 'COMPLETED',
      timestamp: '2026-01-06T16:16:20Z',
      message: 'Reached maximum capacity of 8 instances',
    },
    {
      event_id: 'evt-0t5yn3',
      event_type: 'HEALTH_CHECK',
      event_status: 'COMPLETED',
      timestamp: '2026-01-06T17:00:00Z',
      message: 'All 8 instances passed health check',
    },
    {
      event_id: 'evt-1u6zo4',
      event_type: 'SCALE_IN',
      event_status: 'STARTED',
      timestamp: '2026-01-06T19:30:15Z',
      message: 'Scale-in initiated - CPU utilization dropped to 35%',
    },
    {
      event_id: 'evt-2v7ap5',
      event_type: 'SCALE_IN',
      event_status: 'IN_PROGRESS',
      timestamp: '2026-01-06T19:31:28Z',
      message: 'Draining connections from instance media-processing-asg-08',
    },
    {
      event_id: 'evt-3w8bq6',
      event_type: 'SCALE_IN',
      event_status: 'COMPLETED',
      timestamp: '2026-01-06T19:33:55Z',
      message: 'Instance media-processing-asg-08 terminated successfully',
    },
    {
      event_id: 'evt-4x9cr7',
      event_type: 'SCALE_IN',
      event_status: 'STARTED',
      timestamp: '2026-01-06T20:15:42Z',
      message: 'Continuing scale-in - load decreased further',
    },
    {
      event_id: 'evt-5y0ds8',
      event_type: 'SCALE_IN',
      event_status: 'IN_PROGRESS',
      timestamp: '2026-01-06T20:16:50Z',
      message: 'Terminating instance media-processing-asg-07',
    },
    {
      event_id: 'evt-6z1et9',
      event_type: 'SCALE_IN',
      event_status: 'COMPLETED',
      timestamp: '2026-01-06T20:19:18Z',
      message: 'Scale-in completed - now running 6 instances',
    },
    {
      event_id: 'evt-7a2fu0',
      event_type: 'SCHEDULED_ACTION',
      event_status: 'COMPLETED',
      timestamp: '2026-01-06T22:00:00Z',
      message: 'Nightly scale down executed - desired capacity set to 2',
    },
  ];

  const handleDownloadCSV = () => {
    // Mock CSV download
    const csvContent = [
      ['Event ID', 'Event Type', 'Event Status', 'Message', 'Timestamp'],
      ...events.map((event) => [
        event.event_id,
        event.event_type,
        event.event_status,
        event.message,
        event.timestamp,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asgName}-scaling-logs.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'CSV Downloaded',
      description: `Scaling logs for ${asgName} have been downloaded.`,
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col [&>button]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle>{asgName} scaling logs</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted sticky top-0 z-10">
              <tr className="border-b">
                <th className="text-left px-4 py-3 text-sm font-medium">Event ID</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Event Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Event Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Message</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr
                  key={event.event_id}
                  className={`border-b ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                  } hover:bg-muted/50 transition-colors`}
                >
                  <td className="px-4 py-3 text-sm font-mono">{event.event_id}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-medium">{event.event_type}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <StatusBadge status={event.event_status} />
                  </td>
                  <td className="px-4 py-3 text-sm max-w-md">{event.message}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatTimestamp(event.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

