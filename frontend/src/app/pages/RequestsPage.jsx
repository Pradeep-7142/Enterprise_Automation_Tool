import { Eye, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Btn, Card, EmptyState, PageHeader } from '../components/shared';

export default function RequestsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, loading, error, reload } = useFetch(
    () => flowdeskApi.getRequests({ page, limit }),
    [page],
    { items: [], total: 0 },
  );

  if (loading) return <PageLoader message="Loading requests..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const items = data?.items || [];
  const total = data?.total || 0;
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-5">
      <PageHeader title="Requests" subtitle="Track submissions and approval progress." actionLabel="Create request" actionTo="/requests/new" actionIcon={Plus} />
      {items.length === 0 ? (
        <EmptyState title="No requests found" description="Create a new workflow request to start approval routing." />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Step</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((request) => (
                <tr key={request.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{request.id}</td>
                  <td className="px-4 py-3 font-medium">{request.title}</td>
                  <td className="px-4 py-3">{request.dept || '-'}</td>
                  <td className="px-4 py-3">{request.assignee || '-'}</td>
                  <td className="px-4 py-3 capitalize">{request.priority || 'medium'}</td>
                  <td className="px-4 py-3">
                    <Badge tone={request.status}>{request.status || 'pending'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{request.step || '-'}</td>
                  <td className="px-4 py-3">
                    <Btn as={Link} to={`/requests/${request.id}`} variant="ghost">
                      <Eye size={15} />
                      View
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <div className="flex items-center justify-end gap-2">
        <Btn variant="secondary" disabled={page <= 1} onClick={() => setPage((v) => Math.max(1, v - 1))}>Previous</Btn>
        <span className="text-sm text-slate-500">Page {page} of {pages} ({total} total)</span>
        <Btn variant="secondary" disabled={page >= pages} onClick={() => setPage((v) => Math.min(pages, v + 1))}>Next</Btn>
      </div>
    </div>
  );
}
