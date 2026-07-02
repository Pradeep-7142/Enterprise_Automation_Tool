import { UserPlus, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Avatar, Badge, Btn, Card, EmptyState, PageHeader } from '../components/shared';
import { useApp } from '../context/AppContext';

const ROLE_OPTIONS = [
  'EMPLOYEE', 'MANAGER', 'DEPARTMENT_HEAD', 'FINANCE', 'HR', 'IT', 'AUDITOR', 'VIEWER', 'SUPPORT', 'ORG_ADMIN',
];

const selectClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';
const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700';

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', role: 'EMPLOYEE', dept: '', jobTitle: '' };

function AddMemberForm({ departments, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await flowdeskApi.createEmployee({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
        dept: form.dept || undefined,
        jobTitle: form.jobTitle || undefined,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to add member');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Add a new member</h3>
        <Btn variant="ghost" className="px-2" onClick={onClose}>
          <X size={16} />
        </Btn>
      </div>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <label className="text-sm font-medium">
          First name
          <input className={inputClass} value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required />
        </label>
        <label className="text-sm font-medium">
          Last name
          <input className={inputClass} value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required />
        </label>
        <label className="text-sm font-medium">
          Email
          <input type="email" className={inputClass} value={form.email} onChange={(e) => update('email', e.target.value)} required />
        </label>
        <label className="text-sm font-medium">
          Temporary password
          <input type="text" className={inputClass} value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={6} />
        </label>
        <label className="text-sm font-medium">
          Role
          <select className={selectClass} value={form.role} onChange={(e) => update('role', e.target.value)}>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role} className={selectClass}>
                {role.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Department
          <select className={selectClass} value={form.dept} onChange={(e) => update('dept', e.target.value)}>
            <option value="" className={selectClass}>Unassigned</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name} className={selectClass}>
                {dept.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium md:col-span-2">
          Job title (optional)
          <input className={inputClass} value={form.jobTitle} onChange={(e) => update('jobTitle', e.target.value)} />
        </label>
        {error ? <p className="text-sm text-rose-600 md:col-span-2">{error}</p> : null}
        <div className="flex gap-2 md:col-span-2">
          <Btn type="submit" disabled={busy}>{busy ? 'Adding...' : 'Add member'}</Btn>
          <Btn type="button" variant="secondary" onClick={onClose}>Cancel</Btn>
        </div>
      </form>
    </Card>
  );
}

export default function EmployeesPage() {
  const { user } = useApp();
  const [showForm, setShowForm] = useState(false);
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getEmployees({ page: 1, limit: 100 }), [], { items: [] });
  const departmentsState = useFetch(() => flowdeskApi.getDepartments(), [], []);

  const isAdmin = user?.role === 'ORG_ADMIN' || user?.role === 'SUPER_ADMIN';

  if (loading) return <PageLoader message="Loading employees..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const employees = data?.items || [];
  return (
    <div className="space-y-5">
      <header className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Employees</h1>
          <p className="mt-1 text-sm text-slate-500">Workforce directory with workflow ownership context.</p>
        </div>
        {isAdmin ? (
          <Btn onClick={() => setShowForm((v) => !v)}>
            <UserPlus size={16} />
            Add member
          </Btn>
        ) : null}
      </header>

      {showForm && isAdmin ? (
        <AddMemberForm
          departments={departmentsState.data || []}
          onClose={() => setShowForm(false)}
          onCreated={reload}
        />
      ) : null}

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
