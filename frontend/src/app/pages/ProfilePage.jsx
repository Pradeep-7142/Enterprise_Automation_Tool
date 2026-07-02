import { Building2, Calendar, Edit2, Mail, Save, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Avatar, Badge, Btn, Card, PageHeader, RoleBadge, SectionHeader, inputCls, labelCls } from '../components/shared';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const { user, setUser } = useApp();
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getMe(), [], null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  if (loading) return <PageLoader message="Loading profile…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const current = form || data || {};
  const name = `${current.firstName || ''} ${current.lastName || ''}`.trim() || current.email || 'User';

  function startEdit() {
    setForm({
      firstName: data?.firstName || '',
      lastName: data?.lastName || '',
      jobTitle: data?.jobTitle || data?.title || '',
    });
    setEditing(true);
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setSaveError('');
    try {
      const updated = await flowdeskApi.updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        jobTitle: form.jobTitle || undefined,
      });
      setUser(updated || { ...data, ...form });
      setSaved(true);
      setEditing(false);
      setForm(null);
      reload();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save profile');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Profile" subtitle="Account identity and role assignments." />

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar src={data?.avatarUrl} name={name} size="lg" />
            <div>
              <h2 className="text-xl font-semibold">{name}</h2>
              <p className="text-sm text-slate-500">{data?.jobTitle || data?.title || 'Workflow user'}</p>
              <div className="mt-2">
                <RoleBadge role={data?.role} />
              </div>
            </div>
          </div>
          <Btn variant="secondary" size="sm" onClick={startEdit}>
            <Edit2 size={13} /> Edit profile
          </Btn>
        </div>

        {saved ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/10 dark:text-emerald-400">
            ✓ Profile updated successfully.
          </div>
        ) : null}

        {/* Edit form */}
        {editing ? (
          <form onSubmit={submit} className="mt-4 grid gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 md:grid-cols-2">
            <label className={labelCls}>
              First name
              <input className={inputCls} value={form?.firstName || ''} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
            </label>
            <label className={labelCls}>
              Last name
              <input className={inputCls} value={form?.lastName || ''} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
            </label>
            <label className={`${labelCls} md:col-span-2`}>
              Job title
              <input className={inputCls} value={form?.jobTitle || ''} onChange={(e) => setForm((p) => ({ ...p, jobTitle: e.target.value }))} />
            </label>
            {saveError ? <p className="text-sm text-rose-600 md:col-span-2">{saveError}</p> : null}
            <div className="flex gap-2 md:col-span-2">
              <Btn type="submit" disabled={busy}>
                <Save size={14} />
                {busy ? 'Saving…' : 'Save changes'}
              </Btn>
              <Btn type="button" variant="secondary" onClick={() => { setEditing(false); setForm(null); setSaveError(''); }}>
                Cancel
              </Btn>
            </div>
          </form>
        ) : null}

        {/* Info fields */}
        {!editing && (
          <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
              <p className="mb-1 flex items-center gap-2 font-medium">
                <Mail size={14} className="text-slate-400" /> Email
              </p>
              <p className="text-slate-500">{data?.email || '—'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
              <p className="mb-1 flex items-center gap-2 font-medium">
                <ShieldCheck size={14} className="text-slate-400" /> Role
              </p>
              <RoleBadge role={data?.role} />
            </div>
            {data?.departmentName && (
              <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
                <p className="mb-1 flex items-center gap-2 font-medium">
                  <Building2 size={14} className="text-slate-400" /> Department
                </p>
                <p className="text-slate-500">{data.departmentName}</p>
              </div>
            )}
            {data?.createdAt && (
              <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
                <p className="mb-1 flex items-center gap-2 font-medium">
                  <Calendar size={14} className="text-slate-400" /> Joined
                </p>
                <p className="text-slate-500">{new Date(data.createdAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
