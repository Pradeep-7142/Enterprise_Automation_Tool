import { useState } from 'react';
import { Link } from 'react-router';
import * as flowdeskApi from '../../../services/flowdeskApi';
import { Btn, Card } from '../../components/shared';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('alex@acme.com');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setFeedback('');
    try {
      const response = await flowdeskApi.forgotPassword(email);
      setFeedback(response?.message || 'Reset link sent if account exists.');
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-500">We will send password reset instructions to your email.</p>
        <form className="mt-4 space-y-4" onSubmit={submit}>
          <input className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" value={email} onChange={(e) => setEmail(e.target.value)} />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {feedback ? <p className="text-sm text-emerald-600">{feedback}</p> : null}
          <Btn className="w-full" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </Btn>
          <Link className="block text-center text-sm text-blue-600 hover:underline" to="/login">
            Back to login
          </Link>
        </form>
      </Card>
    </main>
  );
}
