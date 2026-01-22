import { PageShell } from '@/components/page-shell';

export default function TriggeredAlertsPage() {
  return (
    <PageShell
      title="Triggered Alerts"
      description="View and manage triggered alert notifications"
    >
      <div className="rounded-lg border border-dashed p-10 text-center">
        <h3 className="text-lg font-medium">Triggered Alerts</h3>
        <p className="text-sm text-muted-foreground mt-1">
          This page will display all triggered alert notifications
        </p>
      </div>
    </PageShell>
  );
}

