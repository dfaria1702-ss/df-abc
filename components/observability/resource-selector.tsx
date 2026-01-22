'use client';

import { SearchableSelect } from '@/components/ui/searchable-select';

interface ResourceSelectorProps {
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function ResourceSelector({
  options,
  value,
  onValueChange,
  placeholder = 'Select a resource...',
}: ResourceSelectorProps) {
  const selectOptions = options.map(name => ({
    value: name,
    label: name,
  }));

  return (
    <div className="w-full">
      <label className="text-sm font-medium mb-2 block">Resource</label>
      <SearchableSelect
        options={selectOptions}
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        searchPlaceholder="Search resources..."
        emptyText="No resources found."
      />
    </div>
  );
}

