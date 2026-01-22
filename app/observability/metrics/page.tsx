'use client';

import { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { VercelTabs } from '@/components/ui/vercel-tabs';
import { VMMetricsSection } from '@/components/observability/vm-metrics-section';
import { LBMetricsSection } from '@/components/observability/lb-metrics-section';
import { Card, CardContent } from '@/components/ui/card';

const tabs = [
  { id: 'vm', label: 'VM Metrics' },
  { id: 'lb', label: 'LB Metrics' },
];

export default function MetricsPage() {
  const [activeTab, setActiveTab] = useState('vm');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <PageShell
      title="Metrics"
      description="Monitor and analyze infrastructure metrics"
    >
      <div className="space-y-6">
        <VercelTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          size="lg"
        />

        {activeTab === 'vm' && <VMMetricsSection />}
        {activeTab === 'lb' && <LBMetricsSection />}

        <Card className="border-dashed">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              Metrics for other services coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
