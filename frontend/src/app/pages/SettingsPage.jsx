import { Bell, Key, Moon, Save, Shield, Sun } from 'lucide-react';
import { useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Btn, Card, PageHeader, SectionHeader, inputCls, labelCls } from '../components/shared';
import { useApp } from '../context/AppContext';
import { usePermissions } from '../permissions';

function PasswordSection() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (form.next !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.next.length < 6) { setError('New password must be at least 6 characters'); return; }
    setBusy(true); setError(''); setSuccess('');
    try {
      await flowdeskApi.changePassword(form.current, form.next);
      setSuccess('Password changed successfully.');
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <SectionHeader title="Change Password" />
      <form onSubmit={submit} className="grid gap-4 max-w-md">
        <label className={labelCls}>
          Current password
          <input type="password" className={inputCls} value={form.current} onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))} required />
        </label>
        <label className={labelCls}>
          New password
          <input type="password" className={inputCls} value={form.next} onChange={(e) => setForm((p) => ({ ...p, next: e.target.value }))} required minLength={6} />
        </label>
        <label className={labelCls}>
          Confirm new password
          <input type="password" className={inputCls} value={form.confirm} onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))} required />
        </label>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
        <Btn type="submit" disabled={busy} className="self-start">
          <Key size={14} />
          {busy ? 'Updating…' : 'Change password'}
        </Btn>
      </form>
    </Card>
  );
}

export default function SettingsPage() {
  const { darkMode, setDarkMode } = useApp();
  const { can, role } = usePermissions();
  const isAdmin = can('manageOrgSettings');

  const notifState = useFetch(() => flowdeskApi.getUnreadCount(), [], {});
  const unread = notifState.data?.count ?? 0;

  const [notifPrefs, setNotifPrefs] = useState({
    emailApprovals: true,
    emailTasks: true,
    emailMessages: false,
    browserPush: true,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Personal and workspace-level preferences." />

      {/* Appearance */}
      <Card>
        <SectionHeader title="Appearance" />
        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <div>
            <p className="font-medium">Theme</p>
            <p className="text-sm text-slate-500">Currently using {darkMode ? 'dark' : 'light'} mode</p>
          </div>
          <Btn variant="secondary" onClick={() => setDarkMode((v) => !v)}>
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            {darkMode ? 'Light mode' : 'Dark mode'}
          </Btn>
        </div>
      </Card>

      {/* Notification prefs */}
      <Card>
        <SectionHeader title="Notification Preferences" />
        <div className="space-y-3">
          {[
            { key: 'emailApprovals', label: 'Email me on approval decisions', icon: Bell },
            { key: 'emailTasks',     label: 'Email me when tasks are assigned', icon: Bell },
            { key: 'emailMessages',  label: 'Email me new messages', icon: Bell },
            { key: 'browserPush',    label: 'Browser push notifications', icon: Bell },
          ].map(({ key, label, icon: Icon }) => (
            <label key={key} className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm">
                <Icon size={14} className="text-slate-400" />
                <span>{label}</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={notifPrefs[key]}
                  onChange={(e) => setNotifPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                />
                <div
                  className={`h-5 w-9 rounded-full transition ${notifPrefs[key] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  onClick={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))}
                >
                  <div className={`mt-0.5 ml-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${notifPrefs[key] ? 'translate-x-4' : ''}`} />
                </div>
              </div>
            </label>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-800/50">
          <p className="font-medium">Unread notifications</p>
          <p className="text-slate-500">{unread} pending update{unread !== 1 ? 's' : ''}</p>
        </div>
      </Card>

      {/* Change password */}
      <PasswordSection />

      {/* Admin: Org settings shortcut */}
      {isAdmin && (
        <Card>
          <SectionHeader title="Organisation Settings" />
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <Shield size={16} className="text-blue-500" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage organisation name, email domain, and system health from the{' '}
              <a href="/admin" className="text-blue-600 underline">Admin Console</a>.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
