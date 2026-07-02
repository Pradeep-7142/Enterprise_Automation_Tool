import { Download, Filter, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Btn, Card, EmptyState, FilterTabs, PageHeader, RelativeTime, SearchInput } from '../components/shared';
import { usePermissions } from '../permissions';

const ACTION_COLORS = {
  CREATE:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  UPDATE:  'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  DELETE:  'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
  APPROVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  REJECT:  'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
  LOGIN:   'bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400',
  LOGOUT:  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

function actionColor(action = '') {
  const key = Object.keys(ACTION_COLORS).find((k) => action.toUpperCase().includes(k));
  return key ? ACTION_COLORS[key] : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
}

const PAGE_SIZE = 25;

export default function AuditLogsPage() {
  const { can } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, loading, error, reload } = useFetch(
    () => flowdeskApi.getAuditLogs({ page, limit: PAGE_SIZE }),
    [page],
    [],
  );

  if (!can('viewAuditLogs')) {
    return (
      <div className="space-y-5">
        <PageHeader title="Audit Logs" subtitle="Access restricted" />
        <Card className="py-10 text-center">
          <ShieldAlert size={32} className="mx-auto mb-3 text-slate-400" />
          <p className="text-slate-500">Audit logs are restricted to admins and auditors.</p>
        </Card>
      </div>
    );
  }

  if (loading) return <PageLoader message="Loading audit logs…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const logs = Array.isArray(data) ? data : data?.items || [];
  const total = data?.total || logs.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filtered = search
    ? logs.filter((l) => {
        const q = search.toLowerCase();
        return (
          (l.action || l.event || '').toLowerCase().includes(q) ||
          (l.actorName || l.actor || '').toLowerCase().includes(q) ||
          (l.resource || l.target || '').toLowerCase().includes(q)
        );
      })
    : logs;

  function handleExport() {
    if (!filtered.length) return;
    const headers = ['Timestamp', 'Actor', 'Action', 'Resource'];
    const rows = filtered.map((l) => [
      l.createdAt ? new Date(l.createdAt).toISOString() : '',
      l.actorName || l.actor || 'System',
      l.action || l.event || '',
      l.resource || l.target || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit Logs"
        subtitle="Security events and workflow activity history."
        actions={
          <Btn variant="secondary" size="sm" onClick={handleExport}>
            <Download size={14} /> Export CSV
          </Btn>
        }
      />

      {/* Search + pagination info */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput className="max-w-sm flex-1" value={search} onChange={setSearch} placeholder="Search by actor, action, resource…" />
        <span className="text-sm text-slate-500">{filtered.length} entries</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No audit logs found" description="Audit trails appear after system activity." />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Resource</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-t border-slate-200 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium">{log.actorName || log.actor || 'System'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${actionColor(log.action || log.event)}`}>
                      {log.action || log.event || 'Event'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{log.resource || log.target || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Page {page} of {pages}</span>
          <div className="flex gap-2">
            <Btn variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>← Prev</Btn>
            <Btn variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage((v) => v + 1)}>Next →</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
