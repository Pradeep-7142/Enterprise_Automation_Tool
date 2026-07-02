import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Btn, Card, EmptyState, PageHeader, PriorityBadge, RelativeTime, ReasonModal, StatCard } from '../components/shared';
import { usePermissions } from '../permissions';

export default function ApprovalsPage() {
  const { can } = usePermissions();
  const canApprove = can('approveRequests');
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getPendingApprovals(), [], []);

  const [approveModal, setApproveModal] = useState(null); // item to approve
  const [rejectModal, setRejectModal] = useState(null);   // item to reject
  const [busy, setBusy] = useState(false);

  async function handleApprove(reason) {
    setBusy(true);
    try {
      await flowdeskApi.approveRequest(approveModal.id, reason || 'Approved from approvals queue');
      setApproveModal(null);
      reload();
    } catch {}
    setBusy(false);
  }

  async function handleReject(reason) {
    setBusy(true);
    try {
      await flowdeskApi.rejectRequest(rejectModal.id, reason || 'Rejected from approvals queue');
      setRejectModal(null);
      reload();
    } catch {}
    setBusy(false);
  }

  if (loading) return <PageLoader message="Loading approvals…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const approvals = data || [];
  const pending = approvals.filter((a) => !['approved', 'rejected'].includes(a.status));
  const total = approvals.length;

  return (
    <div className="space-y-5">
      <PageHeader title="Approvals" subtitle="Review and action pending workflow requests." />

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total in Queue" value={total} icon={Clock} color="blue" />
        <StatCard title="Awaiting Action" value={pending.length} icon={Clock} color="amber" />
        <StatCard title="Already Actioned" value={total - pending.length} icon={CheckCircle2} color="green" />
      </div>

      {!canApprove ? (
        <Card className="flex items-start gap-3 text-sm text-slate-500">
          <Clock size={15} className="mt-0.5 flex-shrink-0 text-amber-500" />
          You have read-only access to this queue. Approving or rejecting requests is reserved for managers, department heads, finance, HR, and admins.
        </Card>
      ) : null}

      {approvals.length === 0 ? (
        <EmptyState title="No pending approvals" description="Approvals queued for your role will appear here." />
      ) : (
        <div className="space-y-3">
          {approvals.map((item) => {
            const isFinalized = ['approved', 'rejected'].includes(item.status);
            return (
              <Card key={item.id} className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{item.title || item.name || item.id}</p>
                    <Badge tone={item.status}>{item.status || 'pending'}</Badge>
                    {item.priority ? <PriorityBadge priority={item.priority} /> : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Requested by <span className="font-medium">{item.requesterName || item.requestedBy || '—'}</span>
                    {item.dept ? ` · ${item.dept}` : ''}
                  </p>
                  {item.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                  ) : null}
                  <div className="mt-2 text-xs text-slate-400">
                    Submitted <RelativeTime date={item.createdAt} />
                  </div>
                </div>

                {canApprove && !isFinalized ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Btn size="sm" onClick={() => setApproveModal(item)}>
                      <CheckCircle2 size={14} /> Approve
                    </Btn>
                    <Btn size="sm" variant="secondary" onClick={() => setRejectModal(item)}>
                      <XCircle size={14} /> Reject
                    </Btn>
                  </div>
                ) : isFinalized ? (
                  <Badge tone={item.status} className="self-start capitalize">{item.status}</Badge>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      {/* Reason modals */}
      <ReasonModal
        open={!!approveModal}
        onClose={() => setApproveModal(null)}
        onSubmit={handleApprove}
        title={`Approve: ${approveModal?.title || approveModal?.id}`}
        placeholder="Add approval notes (optional)…"
        confirmLabel="Approve"
        variant="success"
        busy={busy}
      />
      <ReasonModal
        open={!!rejectModal}
        onClose={() => setRejectModal(null)}
        onSubmit={handleReject}
        title={`Reject: ${rejectModal?.title || rejectModal?.id}`}
        placeholder="Please state a reason for rejection…"
        confirmLabel="Reject"
        variant="danger"
        busy={busy}
      />
    </div>
  );
}
