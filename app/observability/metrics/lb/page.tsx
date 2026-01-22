import { PageShell } from '@/components/page-shell';
import { LBMetricsSection } from '@/components/observability/lb-metrics-section';

export default function LBMetricsPage() {
  return (
    <PageShell
      title="LB Metrics"
      description="Monitor load balancer performance and traffic metrics"
    >
      <LBMetricsSection />
    </PageShell>
  );
}

