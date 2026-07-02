import { Building2, Edit2, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import {
  Btn, Card, ConfirmDialog, EmptyState, Modal, PageHeader, inputCls, labelCls, selectCls,
} from '../components/shared';
import { usePermissions } from '../permissions';

function DeptModal({ dept, employees, onClose, onSaved }) {
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
          Department Name *
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

export default function DepartmentsPage() {
  const { can } = usePermissions();
  const canManage = can('manageDepartments');

  const [showForm, setShowForm] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [deleteDept, setDeleteDept] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getDepartments(), [], []);
  const empState = useFetch(() => flowdeskApi.getEmployees({ page: 1, limit: 200 }), [], { items: [] });

  const departments = data || [];
  const employees = empState.data?.items || [];

  async function handleDelete() {
    setDeleteBusy(true);
    try {
      await flowdeskApi.deleteDepartment(deleteDept.id);
      setDeleteDept(null);
      reload();
    } catch {}
    setDeleteBusy(false);
  }

  if (loading) return <PageLoader message="Loading departments…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Departments"
        subtitle="Department-level ownership, approval routing, and headcount."
        actions={
          canManage ? (
            <Btn onClick={() => setShowForm(true)}>
              <Plus size={15} /> New department
            </Btn>
          ) : null
        }
      />

      {departments.length === 0 ? (
        <EmptyState
          title="No departments yet"
          description="Create your first department to organise teams and route approvals."
          action={canManage ? <Btn onClick={() => setShowForm(true)}><Plus size={15} /> Create department</Btn> : null}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((dept) => {
            const memberCount = employees.filter((e) => (e.dept || '').toLowerCase() === (dept.name || '').toLowerCase()).length;
            return (
              <Card key={dept.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                      <Building2 size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{dept.name}</h3>
                      <p className="text-xs text-slate-500">{dept.headName || dept.managerName || 'No head assigned'}</p>
                    </div>
                  </div>
                  {canManage ? (
                    <div className="flex gap-1">
                      <Btn size="sm" variant="ghost" onClick={() => setEditDept(dept)} title="Edit"><Edit2 size={13} /></Btn>
                      <Btn size="sm" variant="ghost" className="text-rose-500" onClick={() => setDeleteDept(dept)} title="Delete"><Trash2 size={13} /></Btn>
                    </div>
                  ) : null}
                </div>

                <p className="text-sm text-slate-500">{dept.description || 'No description provided.'}</p>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users size={13} />
                  <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {(showForm || editDept) && (
        <DeptModal
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
        message={`Permanently delete "${deleteDept?.name}"? This cannot be undone and may affect employee assignments.`}
        confirmLabel="Delete"
        variant="danger"
        busy={deleteBusy}
      />
    </div>
  );
}
