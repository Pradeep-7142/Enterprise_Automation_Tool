import { GitBranch, Pause, Play, Plus, Settings } from 'lucide-react';
import { useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Btn, Card, EmptyState, Modal, PageHeader, inputCls, labelCls } from '../components/shared';
import { usePermissions } from '../permissions';

function WorkflowModal({ workflow, onClose, onSaved }) {
  const isEdit = !!workflow;
  const [form, setForm] = useState({
    name: workflow?.name || workflow?.title || '',
    description: workflow?.description || '',
    steps: workflow?.steps?.length || 1,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isEdit) await flowdeskApi.updateWorkflow(workflow.id, { name: form.name, description: form.description });
      else await flowdeskApi.createWorkflow({ name: form.name, description: form.description, steps: form.steps });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save workflow');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Edit Workflow' : 'New Workflow'}>
      <form onSubmit={submit} className="grid gap-4">
        <label className={labelCls}>
          Workflow Name *
          <input className={inputCls} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        </label>
        <label className={labelCls}>
          Description
          <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        </label>
        {!isEdit && (
          <label className={labelCls}>
            Number of Approval Steps
            <input
              type="number"
              min={1}
              max={10}
              className={inputCls}
              value={form.steps}
              onChange={(e) => setForm((p) => ({ ...p, steps: Number(e.target.value) }))}
            />
          </label>
        )}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Btn type="button" variant="secondary" onClick={onClose} disabled={busy}>Cancel</Btn>
          <Btn type="submit" disabled={busy}>{busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create workflow'}</Btn>
        </div>
      </form>
    </Modal>
  );
}

export default function WorkflowBuilderPage() {
  const { can } = usePermissions();
  const canManage = can('manageWorkflows');

  const [showCreate, setShowCreate] = useState(false);
  const [editWorkflow, setEditWorkflow] = useState(null);
  const [toggling, setToggling] = useState(null);

  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getWorkflows(), [], []);

  async function toggleStatus(wf) {
    setToggling(wf.id);
    try {
      if (wf.status === 'active') await flowdeskApi.deactivateWorkflow(wf.id);
      else await flowdeskApi.activateWorkflow(wf.id);
      reload();
    } catch {}
    setToggling(null);
  }

  if (loading) return <PageLoader message="Loading workflows…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const workflows = data || [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Workflow Builder"
        subtitle="Manage route definitions, automation rules, and approval sequences."
        actions={
          canManage ? (
            <Btn onClick={() => setShowCreate(true)}>
              <Plus size={15} /> New workflow
            </Btn>
          ) : null
        }
      />

      {workflows.length === 0 ? (
        <EmptyState
          title="No workflows found"
          description="Create workflow templates to define approval routing sequences."
          action={canManage ? <Btn onClick={() => setShowCreate(true)}><Plus size={15} />Create workflow</Btn> : null}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {workflows.map((wf) => {
            const isActive = wf.status === 'active';
            return (
              <Card key={wf.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <GitBranch size={16} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{wf.name || wf.title || wf.id}</h3>
                      <p className="text-xs text-slate-500">{wf.steps?.length || 0} step{wf.steps?.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge tone={isActive ? 'active' : 'inactive'}>{isActive ? 'Active' : 'Inactive'}</Badge>
                    {canManage ? (
                      <>
                        <Btn size="sm" variant="ghost" onClick={() => setEditWorkflow(wf)} title="Edit">
                          <Settings size={13} />
                        </Btn>
                        <Btn
                          size="sm"
                          variant="ghost"
                          className={isActive ? 'text-amber-500' : 'text-emerald-500'}
                          onClick={() => toggleStatus(wf)}
                          disabled={toggling === wf.id}
                          title={isActive ? 'Deactivate' : 'Activate'}
                        >
                          {isActive ? <Pause size={13} /> : <Play size={13} />}
                        </Btn>
                      </>
                    ) : null}
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-500">{wf.description || 'Workflow routing sequence for request approvals.'}</p>
                {wf.steps?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {wf.steps.slice(0, 4).map((step, i) => (
                      <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {step.name || step.label || `Step ${i + 1}`}
                      </span>
                    ))}
                    {wf.steps.length > 4 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800">+{wf.steps.length - 4} more</span>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {(showCreate || editWorkflow) && (
        <WorkflowModal
          workflow={editWorkflow}
          onClose={() => { setShowCreate(false); setEditWorkflow(null); }}
          onSaved={reload}
        />
      )}
    </div>
  );
}
