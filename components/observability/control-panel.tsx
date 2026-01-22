'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { CalendarIcon } from 'lucide-react';
import { format, subHours, subDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';

export type TimeRangeHours = 1 | 6 | 12 | 24 | 168 | 'custom'; // 1 hour, 6 hours, 12 hours, 1 day, 1 week, custom
export type GranularityMinutes = 1 | 5 | 10 | 30 | 60;

interface ControlPanelProps {
  // Resource selection
  resourceOptions: string[];
  selectedResource: string;
  onResourceChange: (value: string) => void;
  resourcePlaceholder?: string;
  
  // Time range
  timeRange: TimeRangeHours;
  customDateRange: DateRange | undefined;
  onTimeRangeChange: (range: TimeRangeHours) => void;
  onCustomDateRangeChange: (range: DateRange | undefined) => void;
  
  // Granularity
  granularity: GranularityMinutes;
  onGranularityChange: (granularity: GranularityMinutes) => void;
  
  // Confirm
  onConfirm: () => void;
  hasPendingChanges: boolean;
}

const timeRangeOptions: { value: TimeRangeHours; label: string }[] = [
  { value: 1, label: '1 Hour' },
  { value: 6, label: '6 Hours' },
  { value: 12, label: '12 Hours' },
  { value: 24, label: '1 Day' },
  { value: 168, label: '1 Week' },
  { value: 'custom', label: 'Custom Range' },
];

const granularityOptions: { value: GranularityMinutes; label: string }[] = [
  { value: 1, label: '1 min' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
];

export function ControlPanel({
  resourceOptions,
  selectedResource,
  onResourceChange,
  resourcePlaceholder = 'Select a resource...',
  timeRange,
  customDateRange,
  onTimeRangeChange,
  onCustomDateRangeChange,
  granularity,
  onGranularityChange,
  onConfirm,
  hasPendingChanges,
}: ControlPanelProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isDateSelecting, setIsDateSelecting] = useState(false);

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    onCustomDateRangeChange(selectedDate);
    if (selectedDate?.from && selectedDate?.to) {
      setIsDateSelecting(false);
      setIsDatePickerOpen(false);
    } else if (selectedDate?.from && !selectedDate?.to) {
      setIsDateSelecting(true);
    } else {
      setIsDateSelecting(false);
    }
  };

  const handleTimeRangeButtonClick = (range: TimeRangeHours) => {
    onTimeRangeChange(range);
    if (range !== 'custom') {
      onCustomDateRangeChange(undefined);
    }
  };

  const getDateRangeDisplay = () => {
    if (timeRange === 'custom' && customDateRange?.from && customDateRange?.to) {
      return `${format(customDateRange.from, 'MMM dd, yyyy')} - ${format(customDateRange.to, 'MMM dd, yyyy')}`;
    }
    return 'Select date range';
  };

  const resourceSelectOptions = resourceOptions.map(name => ({
    value: name,
    label: name,
  }));

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Resource Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Resource</label>
            <SearchableSelect
              options={resourceSelectOptions}
              value={selectedResource}
              onValueChange={onResourceChange}
              placeholder={resourcePlaceholder}
              searchPlaceholder="Search resources..."
              emptyText="No resources found."
            />
          </div>

          {/* Time Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Time Range</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {timeRangeOptions.map(option => (
                <Button
                  key={option.value}
                  variant={timeRange === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeRangeButtonClick(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            
            {timeRange === 'custom' && (
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {getDateRangeDisplay()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3">
                    {isDateSelecting && customDateRange?.from && (
                      <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
                        <span className="font-medium">Start:</span>{' '}
                        {format(customDateRange.from, 'LLL dd, y')}
                        <br />
                        <span className="text-gray-600">Now select an end date</span>
                      </div>
                    )}
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={customDateRange?.from}
                      selected={customDateRange}
                      onSelect={handleDateSelect}
                      numberOfMonths={2}
                      className="rounded-md"
                      modifiers={{
                        ...(customDateRange?.from && { start: customDateRange.from }),
                        ...(customDateRange?.to && { end: customDateRange.to }),
                      }}
                      modifiersStyles={{
                        start: {
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          fontWeight: 'bold',
                        },
                        end: {
                          backgroundColor: '#ef4444',
                          color: 'white',
                          fontWeight: 'bold',
                        },
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              Maximum time range: 15 days
            </p>
          </div>

          {/* Granularity */}
          <div>
            <label className="text-sm font-medium mb-2 block">Granularity</label>
            <Select
              value={granularity.toString()}
              onValueChange={value =>
                onGranularityChange(Number(value) as GranularityMinutes)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {granularityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={onConfirm}
            disabled={!hasPendingChanges}
            className="w-full"
          >
            Confirm Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
