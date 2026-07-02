import { Building2 } from 'lucide-react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Card, EmptyState, PageHeader } from '../components/shared';

export default function DepartmentsPage() {
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getDepartments(), [], []);

  if (loading) return <PageLoader message="Loading departments..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const departments = data || [];
  return (
    <div className="space-y-5">
      <PageHeader title="Departments" subtitle="Department-level ownership and approval routing teams." />
      {departments.length === 0 ? (
        <EmptyState title="No departments found" description="Create departments in backend admin settings." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((department) => (
            <Card key={department.id}>
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-blue-600" />
                <h3 className="font-semibold">{department.name}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-500">{department.description || 'Department managing functional workflows.'}</p>
              <p className="mt-3 text-xs text-slate-500">Head: {department.headName || department.managerName || '-'}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
