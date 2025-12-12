'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowsUpDownIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  ArrowDown,
  ArrowUp,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  searchable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
}

interface ShadcnDataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  searchableColumns?: string[];
  defaultSort?: {
    column: string;
    direction: 'asc' | 'desc';
  };
  pageSize?: number;
  enableSearch?: boolean;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;
  onRefresh?: () => void;
  enableAutoRefresh?: boolean;
  enableNameFilter?: boolean;
  nameFilterColumn?: string;
  enableVpcFilter?: boolean;
  vpcOptions?: { value: string; label: string }[];
  onVpcChange?: (vpc: string) => void;
  enableStatusFilter?: boolean;
  statusOptions?: { value: string; label: string }[];
  onStatusChange?: (status: string) => void;
  statusFilterColumn?: string;
  searchPlaceholder?: string;
}

export function ShadcnDataTable<T = any>({
  columns,
  data,
  searchableColumns = [],
  defaultSort,
  pageSize = 10,
  enableSearch = true,
  enableColumnVisibility = false,
  enablePagination = true,
  onRefresh,
  enableAutoRefresh = false,
  enableNameFilter = false,
  nameFilterColumn,
  enableVpcFilter = false,
  vpcOptions = [],
  onVpcChange,
  enableStatusFilter = false,
  statusOptions = [],
  onStatusChange,
  statusFilterColumn = 'jobStatus',
  searchPlaceholder,
}: ShadcnDataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>(() => {
    if (defaultSort) {
      console.log('🔄 Using explicit defaultSort:', defaultSort);
      return [
        { id: defaultSort.column, desc: defaultSort.direction === 'desc' },
      ];
    }
    // Auto-sort by "Created On" column if it exists
    const createdOnColumn = columns.find(
      col =>
        (col.key.toLowerCase().includes('created') &&
          col.key.toLowerCase().includes('on')) ||
        col.key.toLowerCase() === 'createdon' ||
        col.key.toLowerCase() === 'created_on'
    );
    if (createdOnColumn) {
      console.log('🔄 Auto-sorting by Created On column:', createdOnColumn.key);
      return [{ id: createdOnColumn.key, desc: true }]; // desc = newest first
    }
    console.log('🔄 No Created On column found, no default sorting');
    return [];
  });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  // Auto-refresh state
  const [isAutoRefreshActive, setIsAutoRefreshActive] = React.useState(false);
  const [refreshInterval, setRefreshInterval] = React.useState('30');
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Last refreshed timestamp state
  const [lastRefreshed, setLastRefreshed] = React.useState<Date | null>(null);

  // Set initial refresh timestamp when component mounts (initial data load)
  React.useEffect(() => {
    if (onRefresh && lastRefreshed === null) {
      setLastRefreshed(new Date());
    }
  }, [onRefresh, lastRefreshed]);

  // Name filter state
  const [selectedNames, setSelectedNames] = React.useState<string[]>([]);

  // VPC filter state
  const [selectedVpc, setSelectedVpc] = React.useState('all');

  // Status filter state
  const [selectedStatus, setSelectedStatus] = React.useState('all');

  // Get unique names for the filter dropdown
  const uniqueNames = React.useMemo(() => {
    if (!enableNameFilter || !nameFilterColumn) {
      return [];
    }
    const names = Array.from(
      new Set(data.map(item => (item as any)[nameFilterColumn]).filter(Boolean))
    );
    return names.sort();
  }, [data, enableNameFilter, nameFilterColumn]);

  // Filter data based on selected names
  const filteredByNames = React.useMemo(() => {
    if (!enableNameFilter || !nameFilterColumn || selectedNames.length === 0) {
      return data;
    }
    return data.filter(item =>
      selectedNames.includes((item as any)[nameFilterColumn])
    );
  }, [data, selectedNames, enableNameFilter, nameFilterColumn]);

  // Filter data based on selected status
  const filteredData = React.useMemo(() => {
    let result = filteredByNames;

    // Apply status filter
    if (enableStatusFilter && selectedStatus !== 'all') {
      result = result.filter(
        item => (item as any)[statusFilterColumn] === selectedStatus
      );
    }

    return result;
  }, [filteredByNames, enableStatusFilter, selectedStatus, statusFilterColumn]);

  // Helper function to format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 10) {
      return 'just now';
    }
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Enhanced refresh handler that updates timestamp
  const handleRefresh = React.useCallback(() => {
    if (onRefresh) {
      onRefresh();
      setLastRefreshed(new Date());
    }
  }, [onRefresh]);

  // Auto-refresh logic with timestamp update
  React.useEffect(() => {
    if (isAutoRefreshActive && onRefresh && enableAutoRefresh) {
      intervalRef.current = setInterval(
        () => {
          onRefresh();
          setLastRefreshed(new Date());
        },
        parseInt(refreshInterval) * 1000
      );
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoRefreshActive, refreshInterval, onRefresh, enableAutoRefresh]);

  // Auto-update the relative time display every 10 seconds
  React.useEffect(() => {
    if (!lastRefreshed) {
      return;
    }

    const updateInterval = setInterval(() => {
      // This will trigger a re-render to update the relative time display
      setLastRefreshed(lastRefreshed);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(updateInterval);
  }, [lastRefreshed]);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleVpcChange = (value: string) => {
    setSelectedVpc(value);
    if (onVpcChange) {
      onVpcChange(value);
    }
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    if (onStatusChange) {
      onStatusChange(value);
    }
  };

  // Convert our column format to TanStack column format
  const tanstackColumns: ColumnDef<T>[] = React.useMemo(() => {
    return columns.map(col => ({
      accessorKey: col.key,
      id: col.key,
      header: ({ column }) => {
        if (!col.sortable) {
          return (
            <div
              className={`text-xs font-medium uppercase tracking-wide ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
            >
              {col.label}
            </div>
          );
        }
        // Determine sort state
        const isSorted = column.getIsSorted();
        const isActive = !!isSorted;
        return (
          <button
            type='button'
            onClick={() => column.toggleSorting(isSorted === 'asc')}
            className={`h-auto p-0 text-xs font-medium uppercase tracking-wide hover:bg-muted/50 transition-colors duration-200 flex items-center group w-full ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'text-left'} pr-2 py-1 rounded-md ${isActive ? 'bg-muted' : ''}`}
            style={{ minWidth: 0 }}
          >
            <span className='truncate'>{col.label}</span>
            {/* Only show arrow if this is the active sort column */}
            {isActive && (
              <span
                className='ml-2 inline-block transition-transform duration-300 ease-in-out'
                style={{
                  transform:
                    isSorted === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                }}
              >
                <ArrowDown className='h-3.5 w-3.5 text-primary' />
              </span>
            )}
            {/* Show faded arrow on hover for sortable but inactive columns */}
            {!isActive && (
              <span className='ml-2 opacity-0 group-hover:opacity-40 transition-opacity duration-200'>
                <ArrowUp className='h-3.5 w-3.5' />
              </span>
            )}
          </button>
        );
      },
      cell: ({ row, getValue }) => {
        const value = getValue();
        if (col.render) {
          return col.render(value, row.original);
        }
        return (
          <div
            className={`text-sm ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
          >
            {String(value ?? '')}
          </div>
        );
      },
      enableSorting: col.sortable,
      enableHiding: true,
    }));
  }, [columns]);

  const table = useReactTable({
    data: filteredData,
    columns: tanstackColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination: {
        pageIndex: 0,
        pageSize: pageSize,
      },
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  // Get the primary searchable column for the search input
  const primarySearchColumn =
    searchableColumns[0] || columns.find(col => col.searchable)?.key;

  return (
    <TooltipProvider delayDuration={0}>
      <div className='w-full space-y-4'>
        {/* Search and Filter Controls */}
        {(enableSearch || enableColumnVisibility) && (
          <div className='flex items-center justify-between'>
            <div className='flex flex-1 items-center space-x-2'>
              {enableSearch && (
                <div className='relative max-w-sm'>
                  <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder={
                      searchPlaceholder ||
                      `Search ${primarySearchColumn ? columns.find(c => c.key === primarySearchColumn)?.label?.toLowerCase() || 'items' : 'items'}...`
                    }
                    value={globalFilter}
                    onChange={event => setGlobalFilter(event.target.value)}
                    className='pl-8 h-9'
                  />
                </div>
              )}

              {enableVpcFilter && vpcOptions.length > 0 && (
                <Select value={selectedVpc} onValueChange={handleVpcChange}>
                  <SelectTrigger className='h-9 w-[150px] rounded-md'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vpcOptions.map(vpc => (
                      <SelectItem key={vpc.value} value={vpc.value}>
                        {vpc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {enableStatusFilter && statusOptions.length > 0 && (
                <Select
                  value={selectedStatus}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className='h-9 w-[150px] rounded-md'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {enableColumnVisibility && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' className='rounded-md'>
                      <SlidersHorizontal className='mr-2 h-4 w-4' />
                      Columns
                      <ChevronDown className='ml-2 h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-[180px]'>
                    {table
                      .getAllColumns()
                      .filter(column => column.getCanHide())
                      .map(column => {
                        const columnDef = columns.find(
                          col => col.key === column.id
                        );
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className='capitalize'
                            checked={column.getIsVisible()}
                            onCheckedChange={value =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {columnDef?.label || column.id}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {enableNameFilter &&
                nameFilterColumn &&
                uniqueNames.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' className='rounded-md'>
                        <SlidersHorizontal className='mr-2 h-4 w-4' />
                        Select{' '}
                        {columns.find(col => col.key === nameFilterColumn)
                          ?.label || nameFilterColumn}
                        {selectedNames.length > 0 && (
                          <span className='ml-1 bg-primary text-primary-foreground text-xs px-1 rounded'>
                            {selectedNames.length}
                          </span>
                        )}
                        <ChevronDown className='ml-2 h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align='start'
                      className='w-[250px] max-h-[300px] overflow-y-auto'
                    >
                      <DropdownMenuCheckboxItem
                        className='font-medium'
                        checked={selectedNames.length === uniqueNames.length}
                        onCheckedChange={checked => {
                          if (checked) {
                            setSelectedNames([...uniqueNames]);
                          } else {
                            setSelectedNames([]);
                          }
                        }}
                      >
                        Select All ({uniqueNames.length})
                      </DropdownMenuCheckboxItem>
                      <div className='border-t my-1' />
                      {uniqueNames.map(name => (
                        <DropdownMenuCheckboxItem
                          key={name}
                          className='capitalize'
                          checked={selectedNames.includes(name)}
                          onCheckedChange={checked => {
                            if (checked) {
                              setSelectedNames([...selectedNames, name]);
                            } else {
                              setSelectedNames(
                                selectedNames.filter(n => n !== name)
                              );
                            }
                          }}
                        >
                          {name}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
            </div>

            <div className='flex items-center space-x-2'>
              {onRefresh && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='outline'
                      onClick={handleRefresh}
                      className='rounded-md h-9'
                      size='icon'
                    >
                      <RefreshCw className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    className='bg-black text-white border-black'
                    sideOffset={8}
                    side='top'
                    align='center'
                    avoidCollisions={true}
                    collisionPadding={15}
                  >
                    <p className='text-xs font-medium'>
                      {lastRefreshed
                        ? `Last refreshed: ${formatRelativeTime(lastRefreshed)}`
                        : 'Never refreshed'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className='rounded-md border'>
          <div className='relative w-full'>
            <table className='w-full caption-bottom text-sm'>
              <thead className='[&_tr]:border-b'>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr
                    key={headerGroup.id}
                    className='border-b transition-colors bg-muted/50'
                  >
                    {headerGroup.headers.map((header, index) => {
                      const isFirst = index === 0;
                      const isLast = index === headerGroup.headers.length - 1;
                      const column = columns.find(col => col.key === header.id);
                      const width = column?.width
                        ? typeof column.width === 'number'
                          ? `${column.width}px`
                          : column.width
                        : undefined;
                      return (
                        <th
                          key={header.id}
                          className={`h-12 px-4 text-left align-middle text-muted-foreground ${isFirst ? 'rounded-tl-md' : ''} ${isLast ? 'rounded-tr-md' : ''}`}
                          style={{ width }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className='[&_tr:last-child]:border-0'>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, rowIndex) => {
                    const isLastRow =
                      rowIndex === table.getRowModel().rows.length - 1;
                    return (
                      <tr
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'
                      >
                        {row.getVisibleCells().map((cell, cellIndex) => {
                          const isFirst = cellIndex === 0;
                          const isLast =
                            cellIndex === row.getVisibleCells().length - 1;
                          const column = columns.find(
                            col => col.key === cell.column.id
                          );
                          const width = column?.width
                            ? typeof column.width === 'number'
                              ? `${column.width}px`
                              : column.width
                            : undefined;
                          return (
                            <td
                              key={cell.id}
                              className={`px-4 py-4 align-middle ${isLastRow && isFirst ? 'rounded-bl-md' : ''} ${isLastRow && isLast ? 'rounded-br-md' : ''}`}
                              style={{ width }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                ) : (
                  <tr className='bg-white'>
                    <td
                      colSpan={columns.length}
                      className='px-4 py-12 text-center'
                    >
                      <div className='flex flex-col items-center justify-center py-6 text-center'>
                        <p className='text-sm font-medium text-muted-foreground'>
                          No results found
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {enablePagination && table.getPageCount() > 1 && (
          <div className='flex items-center justify-between space-x-2 pb-4 px-4'>
            <div className='flex items-center space-x-6'>
              <div className='flex items-center space-x-2'>
                <p className='text-sm font-medium'>Rows per page</p>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={value => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className='h-8 w-[70px]'>
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side='top'>
                    {[5, 10, 20, 30, 40, 50].map(pageSize => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='text-sm text-muted-foreground'>
                {table.getFilteredRowModel().rows.length > 0 ? (
                  <>
                    Showing{' '}
                    <strong>
                      {table.getState().pagination.pageIndex *
                        table.getState().pagination.pageSize +
                        1}
                    </strong>{' '}
                    to{' '}
                    <strong>
                      {Math.min(
                        (table.getState().pagination.pageIndex + 1) *
                          table.getState().pagination.pageSize,
                        table.getFilteredRowModel().rows.length
                      )}
                    </strong>{' '}
                    of{' '}
                    <strong>{table.getFilteredRowModel().rows.length}</strong>{' '}
                    results
                  </>
                ) : (
                  'No results to display'
                )}
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                className='hidden h-8 w-8 p-0 lg:flex'
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className='sr-only'>Go to first page</span>
                <ChevronsLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                className='h-8 w-8 p-0'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className='sr-only'>Go to previous page</span>
                <ChevronLeft className='h-4 w-4' />
              </Button>

              <div className='flex items-center justify-center min-w-[120px] text-sm font-medium px-4'>
                Page {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </div>

              <Button
                variant='outline'
                className='h-8 w-8 p-0'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className='sr-only'>Go to next page</span>
                <ChevronRight className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                className='hidden h-8 w-8 p-0 lg:flex'
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className='sr-only'>Go to last page</span>
                <ChevronsRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
