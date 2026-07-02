import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import * as flowdeskApi from '../../../services/flowdeskApi';
import { Btn, Card } from '../../components/shared';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const token = params.get('token') || '';

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await flowdeskApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        {!token ? (
          <p className="mt-3 text-sm text-rose-600">Reset token is missing from URL.</p>
        ) : done ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-emerald-600">Password changed successfully.</p>
            <Link to="/login" className="text-sm text-blue-600 hover:underline">
              Return to login
            </Link>
          </div>
        ) : (
          <form className="mt-4 space-y-4" onSubmit={submit}>
            <input
              type="password"
              placeholder="New password"
              className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <Btn className="w-full" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update password'}
            </Btn>
          </form>
        )}
      </Card>
    </main>
  );
}
