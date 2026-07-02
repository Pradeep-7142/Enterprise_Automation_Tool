import { Server } from 'lucide-react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Card, PageHeader, StatCard } from '../components/shared';

export default function AdminPage() {
  const { data, loading, error, reload } = useFetch(
    async () => {
      const [stats, health] = await Promise.all([flowdeskApi.getAdminStats(), flowdeskApi.getAdminHealth()]);
      return { stats, health };
    },
    [],
    { stats: {}, health: {} },
  );

  if (loading) return <PageLoader message="Loading admin metrics..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Admin Console" subtitle="Platform health, tenant metrics, and system diagnostics." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tenants" value={data.stats?.tenants ?? 0} />
        <StatCard title="Active Users" value={data.stats?.activeUsers ?? 0} />
        <StatCard title="Queue Depth" value={data.stats?.queueDepth ?? 0} />
        <StatCard title="Incidents" value={data.stats?.incidents ?? 0} />
      </div>
      <Card>
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <Server size={16} className="text-blue-600" />
          Service health
        </h3>
        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">{JSON.stringify(data.health || {}, null, 2)}</pre>
      </Card>
    </div>
  );
}
