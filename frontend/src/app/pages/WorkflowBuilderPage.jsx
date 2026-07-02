import { GitBranch } from 'lucide-react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Card, EmptyState, PageHeader } from '../components/shared';

export default function WorkflowBuilderPage() {
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getWorkflows(), [], []);

  if (loading) return <PageLoader message="Loading workflows..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const workflows = data || [];
  return (
    <div className="space-y-5">
      <PageHeader title="Workflow Builder" subtitle="Manage route definitions, automation rules, and states." />
      {workflows.length === 0 ? (
        <EmptyState title="No workflows found" description="Create workflow templates from admin tools to start automation." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {workflows.map((workflow) => (
            <Card key={workflow.id}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{workflow.name || workflow.title || workflow.id}</h3>
                <GitBranch size={16} className="text-blue-600" />
              </div>
              <p className="mt-2 text-sm text-slate-500">{workflow.description || 'Workflow routing sequence for request approvals.'}</p>
              <div className="mt-3">
                <Badge tone={workflow.status}>{workflow.status || 'active'}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
