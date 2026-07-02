import { BookOpen, Headphones } from 'lucide-react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Card, PageHeader } from '../components/shared';

export default function HelpPage() {
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.globalSearch('help'), [], []);

  if (loading) return <PageLoader message="Loading help resources..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const resources = data || [];
  return (
    <div className="space-y-5">
      <PageHeader title="Help Center" subtitle="Quick references and support links for workflow operations." />
      <Card className="space-y-3">
        <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
          <p className="mb-1 flex items-center gap-2 font-medium">
            <BookOpen size={14} />
            Documentation
          </p>
          <p className="text-slate-500">Use the platform guides for workflow design, approvals, and audit trails.</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
          <p className="mb-1 flex items-center gap-2 font-medium">
            <Headphones size={14} />
            Support
          </p>
          <p className="text-slate-500">Contact your FlowDesk administrator for tenant-specific support channels.</p>
        </div>
        {resources.length ? (
          <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
            <p className="font-medium">Related knowledge results</p>
            <p className="text-slate-500">{resources.length} indexed items matched help search.</p>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
