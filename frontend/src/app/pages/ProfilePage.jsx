import { Mail, ShieldCheck } from 'lucide-react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Avatar, Badge, Card, PageHeader } from '../components/shared';

export default function ProfilePage() {
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getMe(), [], null);

  if (loading) return <PageLoader message="Loading profile..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const name = data?.name || `${data?.firstName || ''} ${data?.lastName || ''}`.trim() || data?.email || 'User';
  return (
    <div className="space-y-5">
      <PageHeader title="Profile" subtitle="Account identity and role assignments." />
      <Card>
        <div className="flex items-center gap-4">
          <Avatar src={data?.avatarUrl} name={name} />
          <div>
            <h2 className="text-xl font-semibold">{name}</h2>
            <p className="text-sm text-slate-500">{data?.title || data?.departmentName || 'Workflow user'}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
            <p className="mb-1 flex items-center gap-2 font-medium">
              <Mail size={14} />
              Email
            </p>
            <p className="text-slate-500">{data?.email}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
            <p className="mb-1 flex items-center gap-2 font-medium">
              <ShieldCheck size={14} />
              Access
            </p>
            <Badge tone="approved">{data?.role || 'Member'}</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
