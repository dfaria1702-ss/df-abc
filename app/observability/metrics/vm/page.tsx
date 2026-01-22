import { PageShell } from '@/components/page-shell';
import { VMMetricsSection } from '@/components/observability/vm-metrics-section';

export default function VMMetricsPage() {
  return (
    <PageShell
      title="VM Metrics"
      description="Monitor virtual machine performance and resource utilization"
    >
      <VMMetricsSection />
    </PageShell>
  );
}

