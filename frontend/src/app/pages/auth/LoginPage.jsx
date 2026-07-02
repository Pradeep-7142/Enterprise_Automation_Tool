import { Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Btn, Card } from '../../components/shared';
import { useApp } from '../../context/AppContext';

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'alex@acme.com', password: 'password123' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to login');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Sign in to FlowDesk</h1>
        <p className="mt-1 text-sm text-slate-500">Use your enterprise credentials to continue.</p>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium">
            Email
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700">
              <Mail size={16} className="text-slate-500" />
              <input
                className="w-full bg-transparent outline-none"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </label>
          <label className="block text-sm font-medium">
            Password
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700">
              <Lock size={16} className="text-slate-500" />
              <input
                type="password"
                className="w-full bg-transparent outline-none"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Btn className="w-full" disabled={busy} type="submit">
            {busy ? 'Signing in...' : 'Sign in'}
          </Btn>
          <div className="flex justify-between text-sm">
            <Link className="text-blue-600 hover:underline" to="/forgot-password">
              Forgot password?
            </Link>
            <span className="text-slate-500">alex@acme.com / password123</span>
          </div>
        </form>
      </Card>
    </main>
  );
}
