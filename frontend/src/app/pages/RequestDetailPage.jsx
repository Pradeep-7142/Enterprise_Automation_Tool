import { Check, X } from 'lucide-react';
import { useParams } from 'react-router';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Btn, Card, PageHeader } from '../components/shared';

export default function RequestDetailPage() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getRequest(id), [id], null);

  async function approve() {
    await flowdeskApi.approveRequest(id, 'Approved from request detail');
    reload();
  }

  async function reject() {
    await flowdeskApi.rejectRequest(id, 'Rejected from request detail');
    reload();
  }

  if (loading) return <PageLoader message="Loading request..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const comments = data?.comments || [{ id: 'placeholder-1', author: 'System', text: 'Comments will appear here when available from API.' }];
  const approvers = data?.approvers || [{ id: 'placeholder-1', name: 'Finance Manager', status: 'pending' }];

  return (
    <div className="space-y-5">
      <PageHeader title={data?.title || `Request ${id}`} subtitle={data?.description || 'Detailed request workflow timeline and metadata.'} />
      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-slate-500">Status</p>
            <Badge tone={data?.status}>{data?.status || 'pending'}</Badge>
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
        <div className="mt-4 flex gap-2">
          <Btn onClick={approve}>
            <Check size={15} />
            Approve
          </Btn>
          <Btn variant="secondary" onClick={reject}>
            <X size={15} />
            Reject
          </Btn>
        </div>
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
        <ul className="space-y-2 text-sm">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <p className="font-medium">{comment.author}</p>
              <p className="text-slate-600 dark:text-slate-300">{comment.text}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
