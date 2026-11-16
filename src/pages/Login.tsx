import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function Login() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    navigate('/dashboard');
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-lg">
          <div className="mb-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary-600 text-white">
              <HeartHandshake className="h-6 w-6" />
            </span>
            <h1 className="mt-3 text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500">
              Log in to manage your donations or NGO activity.
            </p>
          </div>

          {user && !busy && (
            <p className="mb-4 rounded-lg bg-primary-50 px-4 py-2.5 text-sm text-primary-800">
              You are already logged in — head to your{' '}
              <Link to="/dashboard" className="font-semibold underline">dashboard</Link>.
            </p>
          )}

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                required
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                required
                className="input"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            New to Food Connect?{' '}
            <Link to="/signup" className="font-semibold text-primary-700 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-accent-50 border border-accent-200 p-4 text-sm text-accent-700">
          <p className="font-semibold">Demo account</p>
          <p className="mt-1">
            Email: <code className="rounded bg-white px-1.5 py-0.5">demo.donor@foodconnect.demo</code>{' '}
            · Password: <code className="rounded bg-white px-1.5 py-0.5">demo123456</code>
          </p>
        </div>
      </div>
    </div>
  );
}
