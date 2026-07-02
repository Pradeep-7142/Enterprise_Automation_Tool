import {
  Activity, Building2, CheckCircle, Cpu, Database, Edit2, HardDrive,
  RefreshCw, Server, Shield, Users, XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import {
  Avatar, Badge, Btn, Card, ConfirmDialog, EmptyState, FilterTabs, Modal,
  PageHeader, RoleBadge, SearchInput, SectionHeader, StatCard, inputCls, labelCls, selectCls,
} from '../components/shared';
import { ROLE_OPTIONS } from '../permissions';
import { usePermissions } from '../permissions';

/* ─── Users Tab ───────────────────────────────────────────────────────────── */

function EditUserModal({ user, departments, onClose, onSaved }) {
  const [form, setForm] = useState({ role: user.role || 'EMPLOYEE', dept: user.dept || '', jobTitle: user.jobTitle || '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await flowdeskApi.updateEmployee(user.id, { role: form.role, dept: form.dept || undefined, jobTitle: form.jobTitle || undefined });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Edit: ${user.name || user.email}`}>
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

function UsersTab({ departments }) {
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [deactivateUser, setDeactivateUser] = useState(null);
  const [activateUser, setActivateUser] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const { data, loading, error, reload } = useFetch(
    () => flowdeskApi.getEmployees({ page: 1, limit: 200 }),
    [],
    { items: [] },
  );

  const users = (data?.items || []).filter((u) => {
    const q = search.toLowerCase();
    return !q || (u.name || u.email || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  async function handleDeactivate() {
    setActionBusy(true);
    try {
      await flowdeskApi.deactivateEmployee(deactivateUser.id);
      setDeactivateUser(null);
      reload();
    } catch {}
    setActionBusy(false);
  }

  async function handleActivate() {
    setActionBusy(true);
    try {
      await flowdeskApi.activateEmployee(activateUser.id);
      setActivateUser(null);
      reload();
    } catch {}
    setActionBusy(false);
  }

  if (loading) return <PageLoader message="Loading users…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <SearchInput className="max-w-sm" value={search} onChange={setSearch} placeholder="Search by name or email…" />
        <span className="text-sm text-slate-500">{users.length} members</span>
      </div>
      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No users found</td></tr>
            ) : users.map((u) => {
              const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
              const isActive = (u.status || 'active') === 'active';
              return (
                <tr key={u.id} className="border-t border-slate-200 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={name} size="sm" />
                      <div>
                        <p className="font-medium">{name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.dept || '—'}</td>
                  <td className="px-4 py-3"><Badge tone={isActive ? 'active' : 'inactive'}>{isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Btn size="sm" variant="ghost" onClick={() => setEditUser(u)} title="Edit user">
                        <Edit2 size={13} />
                      </Btn>
                      {isActive ? (
                        <Btn size="sm" variant="ghost" className="text-rose-500 hover:text-rose-700" onClick={() => setDeactivateUser(u)} title="Deactivate">
                          <XCircle size={13} />
                        </Btn>
                      ) : (
                        <Btn size="sm" variant="ghost" className="text-emerald-500 hover:text-emerald-700" onClick={() => setActivateUser(u)} title="Activate">
                          <CheckCircle size={13} />
                        </Btn>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {editUser && <EditUserModal user={editUser} departments={departments} onClose={() => setEditUser(null)} onSaved={reload} />}
      <ConfirmDialog
        open={!!deactivateUser}
        onClose={() => setDeactivateUser(null)}
        onConfirm={handleDeactivate}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${deactivateUser?.name || deactivateUser?.email}? They will lose access immediately.`}
        confirmLabel="Deactivate"
        variant="danger"
        busy={actionBusy}
      />
      <ConfirmDialog
        open={!!activateUser}
        onClose={() => setActivateUser(null)}
        onConfirm={handleActivate}
        title="Activate User"
        message={`Re-activate ${activateUser?.name || activateUser?.email}? They will regain access to the platform.`}
        confirmLabel="Activate"
        variant="success"
        busy={actionBusy}
      />
    </div>
  );
}

/* ─── Departments Tab ─────────────────────────────────────────────────────── */

function DeptForm({ dept, employees, onClose, onSaved }) {
  const isEdit = !!dept;
  const [form, setForm] = useState({
    name: dept?.name || '',
    description: dept?.description || '',
    headId: dept?.headId || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isEdit) await flowdeskApi.updateDepartment(dept.id, form);
      else await flowdeskApi.createDepartment(form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save department');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Edit Department' : 'New Department'}>
      <form onSubmit={submit} className="grid gap-4">
        <label className={labelCls}>
          Name *
          <input className={inputCls} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        </label>
        <label className={labelCls}>
          Description
          <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        </label>
        <label className={labelCls}>
          Department Head
          <select className={selectCls} value={form.headId} onChange={(e) => setForm((p) => ({ ...p, headId: e.target.value }))}>
            <option value="">Unassigned</option>
            {employees.map((emp) => {
              const n = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email;
              return <option key={emp.id} value={emp.id}>{n}</option>;
            })}
          </select>
        </label>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Btn type="button" variant="secondary" onClick={onClose} disabled={busy}>Cancel</Btn>
          <Btn type="submit" disabled={busy}>{busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create department'}</Btn>
        </div>
      </form>
    </Modal>
  );
}

function DepartmentsTab({ employees }) {
  const [showForm, setShowForm] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [deleteDept, setDeleteDept] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getDepartments(), [], []);
  const departments = data || [];

  async function handleDelete() {
    setDeleteBusy(true);
    try { await flowdeskApi.deleteDepartment(deleteDept.id); setDeleteDept(null); reload(); } catch {}
    setDeleteBusy(false);
  }

  if (loading) return <PageLoader message="Loading departments…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Btn onClick={() => setShowForm(true)}>
          <Building2 size={15} /> New department
        </Btn>
      </div>
      {departments.length === 0 ? (
        <EmptyState title="No departments yet" description="Create your first department to organise your workforce." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((d) => (
            <Card key={d.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Building2 size={15} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold">{d.name}</h3>
                </div>
                <div className="flex gap-1">
                  <Btn size="sm" variant="ghost" onClick={() => setEditDept(d)}><Edit2 size={13} /></Btn>
                  <Btn size="sm" variant="ghost" className="text-rose-500" onClick={() => setDeleteDept(d)}><XCircle size={13} /></Btn>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-500">{d.description || 'No description.'}</p>
              <p className="mt-3 text-xs text-slate-400">Head: {d.headName || d.managerName || '—'}</p>
            </Card>
          ))}
        </div>
      )}
      {(showForm || editDept) && (
        <DeptForm
          dept={editDept}
          employees={employees}
          onClose={() => { setShowForm(false); setEditDept(null); }}
          onSaved={reload}
        />
      )}
      <ConfirmDialog
        open={!!deleteDept}
        onClose={() => setDeleteDept(null)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={`Permanently delete "${deleteDept?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        busy={deleteBusy}
      />
    </div>
  );
}

/* ─── System Health Tab ───────────────────────────────────────────────────── */

function HealthRow({ label, value, icon: Icon, good }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="flex items-center gap-2 text-sm">
        <Icon size={15} className="text-blue-500" />
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">{value}</span>
        {good !== undefined ? (
          good
            ? <CheckCircle size={14} className="text-emerald-500" />
            : <XCircle size={14} className="text-rose-500" />
        ) : null}
      </div>
    </div>
  );
}

function SystemTab({ health, onRefresh }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Btn variant="secondary" onClick={onRefresh}><RefreshCw size={14} /> Refresh</Btn>
      </div>
      <SectionHeader title="Service Health" />
      <div className="grid gap-2 md:grid-cols-2">
        <HealthRow label="API Status" value={health?.status || 'Unknown'} icon={Server} good={health?.status === 'UP'} />
        <HealthRow label="Database" value={health?.db?.status || 'Unknown'} icon={Database} good={health?.db?.status === 'UP'} />
        <HealthRow label="Disk Space" value={health?.diskSpace ? `${Math.round(health.diskSpace.free / 1e9)} GB free` : '—'} icon={HardDrive} good={health?.diskSpace?.status === 'UP'} />
        <HealthRow label="CPU Load" value={health?.cpu ? `${Math.round(health.cpu * 100)}%` : '—'} icon={Cpu} good={health?.cpu ? health.cpu < 0.8 : undefined} />
      </div>
      {health?.components ? (
        <>
          <SectionHeader title="Components" />
          <Card className="p-0 overflow-hidden">
            <pre className="overflow-x-auto p-4 text-xs text-slate-300 bg-slate-900 rounded-xl">{JSON.stringify(health.components, null, 2)}</pre>
          </Card>
        </>
      ) : null}
    </div>
  );
}

/* ─── Org Settings Tab ────────────────────────────────────────────────────── */

function OrgSettingsTab() {
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getOrgSettings(), [], null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  if (loading) return <PageLoader message="Loading settings…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const current = form || data || {};

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await flowdeskApi.updateOrgSettings(current);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-lg">
      <SectionHeader title="Organisation Details" />
      <label className={labelCls}>
        Organisation Name
        <input className={inputCls} value={current.name || ''} onChange={(e) => setForm((p) => ({ ...(p || current), name: e.target.value }))} />
      </label>
      <label className={labelCls}>
        Email Domain (e.g. company.com)
        <input className={inputCls} value={current.emailDomain || ''} onChange={(e) => setForm((p) => ({ ...(p || current), emailDomain: e.target.value }))} />
      </label>
      <label className={labelCls}>
        Support Email
        <input type="email" className={inputCls} value={current.supportEmail || ''} onChange={(e) => setForm((p) => ({ ...(p || current), supportEmail: e.target.value }))} />
      </label>
      <div className="flex items-center gap-3">
        <Btn type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</Btn>
        {saved ? <span className="text-sm text-emerald-600">✓ Saved!</span> : null}
      </div>
    </form>
  );
}

/* ─── Admin Page ──────────────────────────────────────────────────────────── */

const TABS = [
  { id: 'users',       label: 'Users',          icon: Users },
  { id: 'departments', label: 'Departments',     icon: Building2 },
  { id: 'system',      label: 'System Health',   icon: Activity },
  { id: 'org',         label: 'Org Settings',    icon: Shield },
];

export default function AdminPage() {
  const { can } = usePermissions();
  const [activeTab, setActiveTab] = useState('users');

  const { data, loading, error, reload } = useFetch(
    async () => {
      const [stats, health] = await Promise.all([flowdeskApi.getAdminStats(), flowdeskApi.getAdminHealth()]);
      return { stats, health };
    },
    [],
    { stats: {}, health: {} },
  );

  const empState = useFetch(() => flowdeskApi.getEmployees({ page: 1, limit: 200 }), [], { items: [] });
  const employees = empState.data?.items || [];

  const deptState = useFetch(() => flowdeskApi.getDepartments(), [], []);
  const departments = deptState.data || [];

  if (!can('viewAdmin')) {
    return (
      <div className="space-y-5">
        <PageHeader title="Admin Console" subtitle="Access restricted" />
        <Card className="py-10 text-center">
          <Shield size={32} className="mx-auto mb-3 text-slate-400" />
          <p className="text-slate-500">You do not have permission to access the admin console.</p>
        </Card>
      </div>
    );
  }

  if (loading) return <PageLoader message="Loading admin…" />;

  return (
    <div className="space-y-5">
      <PageHeader title="Admin Console" subtitle="Platform health, user management, and organisation settings." />

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Users" value={data.stats?.activeUsers ?? employees.length} icon={Users} color="blue" />
        <StatCard title="Departments" value={data.stats?.tenants ?? departments.length} icon={Building2} color="purple" />
        <StatCard title="Queue Depth" value={data.stats?.queueDepth ?? 0} icon={Activity} color="amber" />
        <StatCard title="Incidents" value={data.stats?.incidents ?? 0} icon={Shield} color="rose" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition',
              activeTab === id
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-2">
        {activeTab === 'users' && <UsersTab departments={departments} />}
        {activeTab === 'departments' && <DepartmentsTab employees={employees} />}
        {activeTab === 'system' && <SystemTab health={data.health} onRefresh={reload} />}
        {activeTab === 'org' && <OrgSettingsTab />}
      </div>
    </div>
  );
}

function cn(...values) {
  return values.filter(Boolean).join(' ');
}
