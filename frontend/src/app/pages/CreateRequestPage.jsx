import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Btn, Card, PageHeader } from '../components/shared';
import * as flowdeskApi from '../../services/flowdeskApi';

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', amount: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const created = await flowdeskApi.createRequest({
        title: form.title,
        description: form.description,
        priority: form.priority,
        amount: form.amount ? Number(form.amount) : undefined,
      });
      navigate(`/requests/${created.id}`);
    } catch (err) {
      setError(err.message || 'Unable to create request');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader back title="Create Request" subtitle="Submit a workflow request for routing and approvals." />
      <Card>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm font-medium md:col-span-2">
            Title
            <input className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
          </label>
          <label className="text-sm font-medium md:col-span-2">
            Description
            <textarea className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" rows={5} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
          </label>
          <label className="text-sm font-medium">
            Priority
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              value={form.priority}
              onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
            >
              <option className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100" value="low">Low</option>
              <option className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100" value="medium">Medium</option>
              <option className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100" value="high">High</option>
              <option className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100" value="critical">Critical</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Amount
            <input type="number" className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} />
          </label>
          {error ? <p className="text-sm text-rose-600 md:col-span-2">{error}</p> : null}
          <div className="md:col-span-2">
            <Btn type="submit" disabled={busy}>
              {busy ? 'Submitting...' : 'Submit request'}
            </Btn>
          </div>
        </form>
      </Card>
    </div>
  );
}
