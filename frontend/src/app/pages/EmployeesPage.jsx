import { Edit2, Upload, UserCheck, UserMinus, UserPlus, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import {
  Avatar, Badge, Btn, Card, ConfirmDialog, EmptyState, FilterTabs,
  Modal, PageHeader, RoleBadge, SearchInput, StatCard, inputCls, labelCls, selectCls,
} from '../components/shared';
import { ROLE_OPTIONS, usePermissions } from '../permissions';
import { useApp } from '../context/AppContext';

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', role: 'EMPLOYEE', dept: '', jobTitle: '' };

function AddMemberModal({ departments, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function update(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }

  async function submit(e) {
    e.preventDefault();
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
    <Modal open onClose={onClose} title="Add New Member" width="max-w-2xl">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <label className={labelCls}>
          First name *
          <input className={inputCls} value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required />
        </label>
        <label className={labelCls}>
          Last name *
          <input className={inputCls} value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required />
        </label>
        <label className={labelCls}>
          Email *
          <input type="email" className={inputCls} value={form.email} onChange={(e) => update('email', e.target.value)} required />
        </label>
        <label className={labelCls}>
          Temporary password *
          <input type="text" className={inputCls} value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={6} />
        </label>
        <label className={labelCls}>
          Role
          <select className={selectCls} value={form.role} onChange={(e) => update('role', e.target.value)}>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Department
          <select className={selectCls} value={form.dept} onChange={(e) => update('dept', e.target.value)}>
            <option value="">Unassigned</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        </label>
        <label className={`${labelCls} md:col-span-2`}>
          Job title (optional)
          <input className={inputCls} value={form.jobTitle} onChange={(e) => update('jobTitle', e.target.value)} />
        </label>
        {error ? <p className="text-sm text-rose-600 md:col-span-2">{error}</p> : null}
        <div className="flex gap-2 md:col-span-2">
          <Btn type="submit" disabled={busy}>{busy ? 'Adding…' : 'Add member'}</Btn>
          <Btn type="button" variant="secondary" onClick={onClose}>Cancel</Btn>
        </div>
      </form>
    </Modal>
  );
}

function EditEmployeeModal({ employee, departments, onClose, onSaved }) {
  const name = employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email;
  const [form, setForm] = useState({ role: employee.role || 'EMPLOYEE', dept: employee.dept || '', jobTitle: employee.jobTitle || '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await flowdeskApi.updateEmployee(employee.id, { role: form.role, dept: form.dept || undefined, jobTitle: form.jobTitle || undefined });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Edit: ${name}`}>
      <form onSubmit={submit} className="grid gap-4">
        <label className={labelCls}>
          Role
          <select className={selectCls} value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
          </select>
        </label>
        <label className={labelCls}>
          Department
          <select className={selectCls} value={form.dept} onChange={(e) => setForm((p) => ({ ...p, dept: e.target.value }))}>
            <option value="">Unassigned</option>
            {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </label>
        <label className={labelCls}>
          Job Title
          <input className={inputCls} value={form.jobTitle} onChange={(e) => setForm((p) => ({ ...p, jobTitle: e.target.value }))} />
        </label>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Btn type="button" variant="secondary" onClick={onClose} disabled={busy}>Cancel</Btn>
          <Btn type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Btn>
        </div>
      </form>
    </Modal>
  );
}

const STATUS_TABS = [
  { value: 'all',      label: 'All' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function EmployeesPage() {
  const { user } = useApp();
  const { can } = usePermissions();
  const isAdmin = can('manageMembers');
  const canEdit = can('editEmployee');

  const [showAdd, setShowAdd] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [deactivateEmp, setDeactivateEmp] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState('card');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  const { data, loading, error, reload } = useFetch(
    () => flowdeskApi.getEmployees({ page: 1, limit: 200 }),
    [],
    { items: [] },
  );

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      await flowdeskApi.importEmployees(fd);
      reload();
    } catch (err) {
      setImportError(err.message || 'Failed to import CSV');
    } finally {
      setImporting(false);
    }
  }

  const deptState = useFetch(() => flowdeskApi.getDepartments(), [], []);
  const departments = deptState.data || [];

  const employees = (data?.items || []).filter((emp) => {
    const name = (emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email || '').toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !q || name.includes(q) || (emp.email || '').toLowerCase().includes(q) || (emp.dept || '').toLowerCase().includes(q);
    const empStatus = (emp.status || 'active');
    const matchStatus = statusFilter === 'all' || empStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  async function handleDeactivate() {
    setActionBusy(true);
    try {
      await flowdeskApi.deactivateEmployee(deactivateEmp.id);
      setDeactivateEmp(null);
      reload();
    } catch {}
    setActionBusy(false);
  }

  if (loading) return <PageLoader message="Loading employees…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const total = data?.items?.length || 0;
  const activeCount = (data?.items || []).filter((e) => (e.status || 'active') === 'active').length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Employees"
        subtitle="Workforce directory with role, department, and status management."
        actions={
          isAdmin ? (
            <div className="flex gap-2">
              <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <Upload size={14} className="text-slate-500" />
                <span>{importing ? 'Importing…' : 'Import CSV'}</span>
                <input type="file" accept=".csv" className="sr-only" onChange={handleImport} disabled={importing} />
              </label>
              <Btn onClick={() => setShowAdd(true)}>
                <UserPlus size={15} /> Add member
              </Btn>
            </div>
          ) : null
        }
      />

      {importError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/10 dark:text-rose-400">
          ⚠️ {importError}
        </div>
      ) : null}


      {/* Summary stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Members" value={total} icon={Users} color="blue" />
        <StatCard title="Active" value={activeCount} icon={UserCheck} color="green" />
        <StatCard title="Inactive" value={total - activeCount} icon={UserMinus} color="amber" />
      </div>

      {/* Search + filter toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput className="max-w-sm flex-1" value={search} onChange={setSearch} placeholder="Search by name, email, department…" />
        <FilterTabs options={STATUS_TABS} value={statusFilter} onChange={setStatusFilter} />
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            className={`px-3 py-1.5 text-xs font-medium ${view === 'card' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            onClick={() => setView('card')}
          >Grid</button>
          <button
            className={`px-3 py-1.5 text-xs font-medium ${view === 'table' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            onClick={() => setView('table')}
          >Table</button>
        </div>
      </div>

      {/* Content */}
      {employees.length === 0 ? (
        <EmptyState title="No employees found" description="Try adjusting your search or filters." />
      ) : view === 'card' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {employees.map((emp) => {
            const name = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email;
            const isActive = (emp.status || 'active') === 'active';
            return (
              <Card key={emp.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={name} />
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{name}</h3>
                      <p className="truncate text-sm text-slate-500">{emp.email}</p>
                    </div>
                  </div>
                  {canEdit ? (
                    <div className="flex gap-1 flex-shrink-0">
                      <Btn size="sm" variant="ghost" onClick={() => setEditEmp(emp)} title="Edit"><Edit2 size={13} /></Btn>
                      {isActive ? (
                        <Btn size="sm" variant="ghost" className="text-rose-500" onClick={() => setDeactivateEmp(emp)} title="Deactivate">
                          <X size={13} />
                        </Btn>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <RoleBadge role={emp.role} />
                  {emp.dept ? <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">{emp.dept}</span> : null}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{emp.jobTitle || emp.title || '—'}</span>
                  <Badge tone={isActive ? 'active' : 'inactive'}>{isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Job Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {canEdit ? <th className="px-4 py-3 font-medium">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const name = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email;
                const isActive = (emp.status || 'active') === 'active';
                return (
                  <tr key={emp.id} className="border-t border-slate-200 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={name} size="sm" />
                        <div>
                          <p className="font-medium">{name}</p>
                          <p className="text-xs text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><RoleBadge role={emp.role} /></td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{emp.dept || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{emp.jobTitle || '—'}</td>
                    <td className="px-4 py-3"><Badge tone={isActive ? 'active' : 'inactive'}>{isActive ? 'Active' : 'Inactive'}</Badge></td>
                    {canEdit ? (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Btn size="sm" variant="ghost" onClick={() => setEditEmp(emp)}><Edit2 size={13} /></Btn>
                          {isActive && <Btn size="sm" variant="ghost" className="text-rose-500" onClick={() => setDeactivateEmp(emp)}><X size={13} /></Btn>}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <p className="text-sm text-slate-500">Showing {employees.length} of {total} employees</p>

      {showAdd && (
        <AddMemberModal departments={departments} onClose={() => setShowAdd(false)} onCreated={reload} />
      )}
      {editEmp && (
        <EditEmployeeModal employee={editEmp} departments={departments} onClose={() => setEditEmp(null)} onSaved={reload} />
      )}
      <ConfirmDialog
        open={!!deactivateEmp}
        onClose={() => setDeactivateEmp(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Employee"
        message={`Deactivate ${deactivateEmp?.name || deactivateEmp?.email}? They will lose platform access.`}
        confirmLabel="Deactivate"
        variant="danger"
        busy={actionBusy}
      />
    </div>
  );
}
