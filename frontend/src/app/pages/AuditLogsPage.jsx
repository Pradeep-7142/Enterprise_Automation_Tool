import { ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Card, EmptyState, PageHeader } from '../components/shared';

export default function AuditLogsPage() {
  const [page] = useState(1);
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getAuditLogs({ page, limit: 50 }), [page], []);

  if (loading) return <PageLoader message="Loading audit logs..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const logs = Array.isArray(data) ? data : data?.items || [];
  return (
    <div className="space-y-5">
      <PageHeader title="Audit Logs" subtitle="Trace security events and workflow history." />
      {logs.length === 0 ? (
        <EmptyState title="No audit logs found" description="Audit trails appear after system activity." />
      ) : (
        <Card className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-blue-600" />
                <p className="font-medium">{log.action || log.event || 'Audit event'}</p>
              </div>
              <p className="mt-1 text-slate-500">
                {log.actorName || log.actor || 'System'} - {log.resource || log.target || 'workflow'}
              </p>
              <p className="mt-1 text-xs text-slate-400">{log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}</p>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
