import { Check, MessageSquare, Paperclip, Send, X } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Btn, Card, PageHeader, PriorityBadge, RelativeTime, ReasonModal } from '../components/shared';
import { usePermissions } from '../permissions';
import { useApp } from '../context/AppContext';

function ApprovalTimeline({ steps }) {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="space-y-1">
      {steps.map((step, i) => {
        const done = step.status === 'approved';
        const rejected = step.status === 'rejected';
        const current = step.status === 'pending' || step.status === 'in_review';
        return (
          <div key={step.id || i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold border-2 ${
                done ? 'border-emerald-500 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' :
                rejected ? 'border-rose-500 bg-rose-100 text-rose-700 dark:bg-rose-900/30' :
                current ? 'border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                'border-slate-300 bg-slate-100 text-slate-500 dark:bg-slate-800'
              }`}>
                {done ? <Check size={10} /> : rejected ? <X size={10} /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className="mt-1 w-px flex-1 bg-slate-200 dark:bg-slate-700" style={{ height: 20 }} />}
            </div>
            <div className="pb-3 min-w-0">
              <p className="text-sm font-medium">{step.name || step.label || `Step ${i + 1}`}</p>
              <p className="text-xs text-slate-500">{step.assigneeName || step.approver || '—'}</p>
              {step.comment ? <p className="mt-1 text-xs text-slate-400 italic">"{step.comment}"</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RequestDetailPage() {
  const { id } = useParams();
  const { user } = useApp();
  const { can } = usePermissions();
  const canApprove = can('approveRequests');
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getRequest(id), [id], null);

  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [approveBusy, setApproveBusy] = useState(false);
  const [rejectBusy, setRejectBusy] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const status = data?.status;
  const isFinalized = status === 'approved' || status === 'rejected';

  async function handleApprove(reason) {
    setApproveBusy(true);
    setActionError('');
    try {
      await flowdeskApi.approveRequest(id, reason || 'Approved');
      setApproveModal(false);
      reload();
    } catch (err) {
      setActionError(err.message || 'Unable to approve');
    } finally {
      setApproveBusy(false);
    }
  }

  async function handleReject(reason) {
    setRejectBusy(true);
    setActionError('');
    try {
      await flowdeskApi.rejectRequest(id, reason || 'Rejected');
      setRejectModal(false);
      reload();
    } catch (err) {
      setActionError(err.message || 'Unable to reject');
    } finally {
      setRejectBusy(false);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentBusy(true);
    try {
      await flowdeskApi.addRequestComment(id, commentText.trim());
      setCommentText('');
      reload();
    } catch {}
    setCommentBusy(false);
  }

  if (loading) return <PageLoader message="Loading request…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const approvalSteps = data?.approvalSteps || data?.steps || [];
  const approvers = data?.approvers || (data?.assignee ? [{ id: 'a0', name: data.assignee, status }] : []);
  const comments = data?.comments || [];
  const attachments = data?.attachments || [];

  return (
    <div className="space-y-5">
      <PageHeader
        back
        title={data?.title || `Request ${id}`}
        subtitle={data?.description || 'Workflow request detail view.'}
      />

      {/* Metadata Card */}
      <Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Status</p>
            <Badge tone={status} className="mt-1">{status || 'pending'}</Badge>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Priority</p>
            <div className="mt-1"><PriorityBadge priority={data?.priority} /></div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Department</p>
            <p className="mt-1 text-sm">{data?.dept || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Current Step</p>
            <p className="mt-1 text-sm">{data?.step || '—'}</p>
          </div>
          {data?.assignee && (
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Assignee</p>
              <p className="mt-1 text-sm">{data.assignee}</p>
            </div>
          )}
          {data?.amount != null && (
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Amount</p>
              <p className="mt-1 text-sm font-semibold">${Number(data.amount).toLocaleString()}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Submitted</p>
            <p className="mt-1 text-sm"><RelativeTime date={data?.createdAt} /></p>
          </div>
        </div>

        {/* Approve / Reject actions */}
        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
          {isFinalized ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-800/50">
              This request was <span className="font-semibold capitalize">{status}</span>. No further action is available.
            </div>
          ) : canApprove ? (
            <div className="flex flex-wrap gap-2">
              <Btn onClick={() => setApproveModal(true)}>
                <Check size={15} /> Approve
              </Btn>
              <Btn variant="secondary" onClick={() => setRejectModal(true)}>
                <X size={15} /> Reject
              </Btn>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              You do not have permission to approve or reject requests.
            </div>
          )}
          {actionError ? <p className="mt-2 text-sm text-rose-600">{actionError}</p> : null}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Approval timeline */}
        {(approvalSteps.length > 0 || approvers.length > 0) && (
          <Card>
            <h3 className="mb-4 font-semibold">Approval Steps</h3>
            {approvalSteps.length > 0 ? (
              <ApprovalTimeline steps={approvalSteps} />
            ) : (
              <ul className="space-y-2 text-sm">
                {approvers.map((approver) => (
                  <li key={approver.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                    <span>{approver.name}</span>
                    <Badge tone={approver.status}>{approver.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {/* Attachments */}
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Paperclip size={15} className="text-slate-500" />
            Attachments
          </h3>
          {attachments.length === 0 ? (
            <p className="text-sm text-slate-500">No files attached.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {attachments.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
                  <span className="truncate">{f.name || f.fileName}</span>
                  <span className="text-xs text-slate-500">{f.size || '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Comments */}
      <Card>
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <MessageSquare size={15} className="text-slate-500" />
          Comments ({comments.length})
        </h3>
        {comments.length > 0 ? (
          <ul className="mb-4 space-y-3">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{comment.author || comment.authorName || 'User'}</p>
                  <RelativeTime date={comment.createdAt} />
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{comment.text || comment.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-slate-500">No comments yet. Be the first to add one.</p>
        )}

        {/* Add comment */}
        <form onSubmit={submitComment} className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700"
            placeholder="Add a comment…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Btn type="submit" disabled={commentBusy || !commentText.trim()}>
            <Send size={14} />
          </Btn>
        </form>
      </Card>

      {/* Reason modals */}
      <ReasonModal
        open={approveModal}
        onClose={() => setApproveModal(false)}
        onSubmit={handleApprove}
        title={`Approve: ${data?.title}`}
        placeholder="Add approval notes (optional)…"
        confirmLabel="Approve"
        variant="success"
        busy={approveBusy}
      />
      <ReasonModal
        open={rejectModal}
        onClose={() => setRejectModal(false)}
        onSubmit={handleReject}
        title={`Reject: ${data?.title}`}
        placeholder="Please state a reason for rejection…"
        confirmLabel="Reject"
        variant="danger"
        busy={rejectBusy}
      />
    </div>
  );
}
