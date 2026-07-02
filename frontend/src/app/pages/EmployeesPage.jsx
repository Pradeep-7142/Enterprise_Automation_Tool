import { Users } from 'lucide-react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Avatar, Badge, Card, EmptyState, PageHeader } from '../components/shared';

export default function EmployeesPage() {
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getEmployees({ page: 1, limit: 100 }), [], { items: [] });

  if (loading) return <PageLoader message="Loading employees..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const employees = data?.items || [];
  return (
    <div className="space-y-5">
      <PageHeader title="Employees" subtitle="Workforce directory with workflow ownership context." />
      {employees.length === 0 ? (
        <EmptyState title="No employees found" description="Employee records will appear after directory sync." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {employees.map((employee) => (
            <Card key={employee.id}>
              <div className="flex items-center gap-3">
                <Avatar initials={employee.avatar} name={employee.name || employee.email} />
                <div>
                  <h3 className="font-semibold">{employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email}</h3>
                  <p className="text-sm text-slate-500">{employee.email}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span>{employee.dept || employee.role || 'Unassigned'}</span>
                <Badge tone={employee.status || 'active'}>{employee.status || 'active'}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
      <p className="inline-flex items-center gap-2 text-sm text-slate-500">
        <Users size={15} />
        Showing {employees.length} employees
      </p>
    </div>
  );
}
