import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Btn, Card, PageHeader } from '../components/shared';
import { usePermissions } from '../permissions';

export default function RequestDetailPage() {
  const { id } = useParams();
  const { can } = usePermissions();
  const canApprove = can('approveRequests');
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getRequest(id), [id], null);
  const [busy, setBusy] = useState('');
  const [actionError, setActionError] = useState('');

  const status = data?.status;
  const isFinalized = status === 'approved' || status === 'rejected';

  async function approve() {
    setBusy('approve');
    setActionError('');
    try {
      await flowdeskApi.approveRequest(id, 'Approved from request detail');
      reload();
    } catch (err) {
      setActionError(err.message || 'Unable to approve request');
    } finally {
      setBusy('');
    }
  }

  async function reject() {
    setBusy('reject');
    setActionError('');
    try {
      await flowdeskApi.rejectRequest(id, 'Rejected from request detail');
      reload();
    } catch (err) {
      setActionError(err.message || 'Unable to reject request');
    } finally {
      setBusy('');
    }
  }

  if (loading) return <PageLoader message="Loading request..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const approverStatus = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending';
  const approvers = data?.approvers || [
    { id: 'assignee', name: data?.assignee || 'Assigned approver', status: approverStatus },
  ];
  const comments = data?.comments || [];

  function approveLabel() {
    if (busy === 'approve') return 'Approving...';
    if (status === 'approved') return 'Approved';
    return 'Approve';
  }

  function rejectLabel() {
    if (busy === 'reject') return 'Rejecting...';
    if (status === 'rejected') return 'Rejected';
    return 'Reject';
  }

  return (
    <div className="space-y-5">
      <PageHeader
        back
        title={data?.title || `Request ${id}`}
        subtitle={data?.description || 'Detailed request workflow timeline and metadata.'}
      />
      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-slate-500">Status</p>
            <Badge tone={status}>{status || 'pending'}</Badge>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Priority</p>
            <p className="capitalize">{data?.priority || '-'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Assignee</p>
            <p>{data?.assignee || '-'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Department</p>
            <p>{data?.dept || '-'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Current Step</p>
            <p>{data?.step || '-'}</p>
          </div>
        </div>

        {isFinalized ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-800/50">
            This request has been <span className="font-semibold capitalize">{status}</span>. No further action is available.
          </div>
        ) : canApprove ? (
          <div className="mt-4 flex gap-2">
            <Btn onClick={approve} disabled={!!busy || isFinalized}>
              <Check size={15} />
              {approveLabel()}
            </Btn>
            <Btn variant="secondary" onClick={reject} disabled={!!busy || isFinalized}>
              <X size={15} />
              {rejectLabel()}
            </Btn>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            You do not have permission to approve or reject requests. This action is reserved for managers, department heads, finance, HR, and admins.
          </div>
        )}
        {actionError ? <p className="mt-3 text-sm text-rose-600">{actionError}</p> : null}
      </Card>

      <Card>
        <h3 className="mb-2 font-semibold">Approvers</h3>
        <ul className="space-y-2 text-sm">
          {approvers.map((approver) => (
            <li key={approver.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <span>{approver.name}</span>
              <Badge tone={approver.status}>{approver.status}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="mb-2 font-semibold">Comments</h3>
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500">No comments yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <p className="font-medium">{comment.author}</p>
                <p className="text-slate-600 dark:text-slate-300">{comment.text}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
