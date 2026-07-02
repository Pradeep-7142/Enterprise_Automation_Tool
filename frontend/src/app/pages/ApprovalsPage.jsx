import { CheckCircle2, XCircle } from 'lucide-react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Btn, Card, EmptyState, PageHeader } from '../components/shared';

export default function ApprovalsPage() {
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getPendingApprovals(), [], []);

  async function approve(id) {
    await flowdeskApi.approveRequest(id, 'Approved from pending approvals');
    reload();
  }

  async function reject(id) {
    await flowdeskApi.rejectRequest(id, 'Rejected from pending approvals');
    reload();
  }

  if (loading) return <PageLoader message="Loading approvals..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const approvals = data || [];
  return (
    <div className="space-y-5">
      <PageHeader title="Approvals" subtitle="Review and action pending workflow requests." />
      {approvals.length === 0 ? (
        <EmptyState title="No pending approvals" description="Approvals queued for your role will appear here." />
      ) : (
        <Card className="space-y-3">
          {approvals.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div>
                <p className="font-medium">{item.title || item.name || item.id}</p>
                <p className="text-sm text-slate-500">{item.requesterName || item.requestedBy || '-'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={item.status}>{item.status || 'pending'}</Badge>
                <Btn onClick={() => approve(item.id)}>
                  <CheckCircle2 size={15} />
                  Approve
                </Btn>
                <Btn variant="secondary" onClick={() => reject(item.id)}>
                  <XCircle size={15} />
                  Reject
                </Btn>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
