'use client';

import { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { CreateButton } from '../../components/create-button';
import { StatusBadge } from '../../components/status-badge';
import { databases } from '../../lib/data';
import { ActionMenu } from '../../components/action-menu';
import { ShadcnDataTable } from '../../components/ui/shadcn-data-table';
import {
  filterDataForUser,
  shouldShowEmptyState,
  getEmptyStateMessage,
} from '../../lib/demo-data-filter';
import { EmptyState } from '../../components/ui/empty-state';
import { Card, CardContent } from '../../components/ui/card';
import { Database, Pause, Play, RotateCcw, FolderDown, ArrowUpCircle } from 'lucide-react';

export default function DatabaseListPage() {
  // State for DB type filter
  const [selectedDbType, setSelectedDbType] = useState('all');

  // Filter data based on user type for demo
  const userFilteredDatabases = filterDataForUser(databases);
  const showEmptyState = shouldShowEmptyState() && userFilteredDatabases.length === 0;

  // Get unique DB engines for filter dropdown
  const dbTypeOptions = [
    { value: 'all', label: 'All Types' },
    ...Array.from(new Set(databases.map(db => db.dbEngine)))
      .sort()
      .map(engine => ({
        value: engine,
        label: engine,
      })),
  ];

  // Filter databases by selected type
  const filteredDatabases = selectedDbType === 'all'
    ? userFilteredDatabases
    : userFilteredDatabases.filter(db => db.dbEngine === selectedDbType);

  // Handler functions for database actions
  const handlePauseResume = (database: any) => {
    const action = database.status === 'stopped' ? 'Resume' : 'Pause';
    console.log(`${action} database:`, database.name);
    // Mock API call
  };

  const handleRestart = (database: any) => {
    console.log('Restart database:', database.name);
    // Mock API call
  };

  const handleCreateFromBackup = (database: any) => {
    console.log('Create DB from backup:', database.name);
    // Mock navigation to create from backup flow
  };

  const handleRestoreFromBackup = (database: any) => {
    console.log('Restore DB from backup:', database.name);
    // Mock navigation to restore flow
  };

  const handleUpgrade = (database: any) => {
    console.log('Upgrade database:', database.name);
    // Mock navigation to upgrade flow
  };

  const handleDelete = (database: any) => {
    console.log('Delete database:', database.name);
    // Mock delete confirmation
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      searchable: true,
      render: (value: string, row: any) => (
        <a
          href={`/database/${row.id}`}
          className='text-primary font-medium hover:underline leading-5'
        >
          {row.name}
        </a>
      ),
    },
    {
      key: 'dbEngine',
      label: 'DB Engine',
      sortable: true,
      searchable: true,
      render: (value: string) => (
        <span className='text-foreground leading-5'>{value}</span>
      ),
    },
    {
      key: 'engineVersion',
      label: 'Engine Version',
      sortable: true,
      render: (value: string) => (
        <span className='text-muted-foreground leading-5'>{value}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: 'createdOn',
      label: 'Created On',
      sortable: true,
      render: (value: string) => {
        const date = new Date(value);
        return (
          <div className='text-muted-foreground leading-5'>
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right' as const,
      render: (value: any, row: any) => {
        // Define custom actions based on database status
        const customActions = [
          {
            label: row.status === 'stopped' ? 'Resume' : 'Pause',
            onClick: () => handlePauseResume(row),
            icon: row.status === 'stopped' ? (
              <Play className='mr-2 h-4 w-4' />
            ) : (
              <Pause className='mr-2 h-4 w-4' />
            ),
          },
          {
            label: 'Restart',
            onClick: () => handleRestart(row),
            icon: <RotateCcw className='mr-2 h-4 w-4' />,
          },
          {
            label: 'Create DB from Backup',
            onClick: () => handleCreateFromBackup(row),
            icon: <FolderDown className='mr-2 h-4 w-4' />,
          },
          {
            label: 'Restore DB from Backup',
            onClick: () => handleRestoreFromBackup(row),
            icon: <FolderDown className='mr-2 h-4 w-4' />,
          },
          {
            label: 'Upgrade',
            onClick: () => handleUpgrade(row),
            icon: <ArrowUpCircle className='mr-2 h-4 w-4' />,
          },
        ];

        return (
          <div className='flex justify-end'>
            <ActionMenu
              viewHref={`/database/${row.id}`}
              onCustomDelete={() => handleDelete(row)}
              resourceName={row.name}
              resourceType='Database'
              customActions={customActions}
            />
          </div>
        );
      },
    },
  ];

  const handleRefresh = () => {
    console.log('🔄 Refreshing database data at:', new Date().toLocaleTimeString());
  };

  // Database illustration icon
  const databaseIcon = (
    <Database className='w-72 h-72 text-muted-foreground/20' strokeWidth={0.5} />
  );

  return (
    <PageShell
      title='Database'
      description='Create and manage your database instances with support for MySQL, PostgreSQL, MongoDB, Redis, and more.'
      headerActions={
        <CreateButton href='/database/create' label='Create Database' />
      }
    >
      {showEmptyState ? (
        <Card className='mt-8'>
          <CardContent>
            <EmptyState
              {...getEmptyStateMessage('database')}
              onAction={() => (window.location.href = '/database/create')}
              icon={databaseIcon}
            />
          </CardContent>
        </Card>
      ) : (
        <ShadcnDataTable
          columns={columns}
          data={filteredDatabases}
          searchableColumns={['name', 'dbEngine']}
          pageSize={10}
          enableSearch={true}
          enableColumnVisibility={false}
          enablePagination={true}
          onRefresh={handleRefresh}
          enableAutoRefresh={true}
          enableVpcFilter={true}
          vpcOptions={dbTypeOptions}
          onVpcChange={setSelectedDbType}
        />
      )}
    </PageShell>
  );
}

