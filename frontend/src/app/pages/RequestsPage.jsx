import { Eye, Plus, Search } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Btn, Card, EmptyState, FilterTabs, PageHeader, PriorityBadge, SearchInput } from '../components/shared';
import { usePermissions } from '../permissions';

const STATUS_TABS = [
  { value: 'all',       label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'in_review', label: 'In Review' },
  { value: 'approved',  label: 'Approved' },
  { value: 'rejected',  label: 'Rejected' },
];

export default function RequestsPage() {
  const { can } = usePermissions();
  const canCreate = can('createRequest');

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const limit = 20;

  const { data, loading, error, reload } = useFetch(
    () => flowdeskApi.getRequests({ page, limit, status: statusFilter !== 'all' ? statusFilter : undefined }),
    [page, statusFilter],
    { items: [], total: 0 },
  );

  if (loading) return <PageLoader message="Loading requests…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const allItems = data?.items || [];
  const items = search
    ? allItems.filter((r) => (r.title || '').toLowerCase().includes(search.toLowerCase()) || (r.id || '').toString().includes(search))
    : allItems;
  const total = data?.total || 0;
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Requests"
        subtitle="Track submissions and approval progress across all workflows."
        actionLabel={canCreate ? 'Create request' : undefined}
        actionTo={canCreate ? '/requests/new' : undefined}
        actionIcon={Plus}
      />

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterTabs options={STATUS_TABS} value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} />
        <SearchInput className="max-w-xs ml-auto" value={search} onChange={setSearch} placeholder="Search by title or ID…" />
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No requests found"
          description={statusFilter !== 'all' ? `No ${statusFilter} requests.` : 'Create a workflow request to start approval routing.'}
          action={canCreate ? <Btn as={Link} to="/requests/new"><Plus size={15} />New request</Btn> : null}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Step</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((request) => (
                <tr
                  key={request.id}
                  className="border-t border-slate-200 transition hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{request.id}</td>
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">{request.title}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{request.dept || '—'}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={request.priority} /></td>
                  <td className="px-4 py-3"><Badge tone={request.status}>{request.status || 'pending'}</Badge></td>
                  <td className="px-4 py-3 text-slate-500">{request.step || '—'}</td>
                  <td className="px-4 py-3">
                    <Btn as={Link} to={`/requests/${request.id}`} variant="ghost" size="sm">
                      <Eye size={13} /> View
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-slate-500">{total} total · Page {page} of {pages}</span>
        <div className="flex gap-2">
          <Btn variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((v) => Math.max(1, v - 1))}>← Previous</Btn>
          <Btn variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage((v) => Math.min(pages, v + 1))}>Next →</Btn>
        </div>
      </div>
    </div>
  );
}
