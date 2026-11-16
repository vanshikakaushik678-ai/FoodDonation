import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, UserRound } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import type { UserRole } from '@/lib/types';

export default function SignUp() {
  const { signUp, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('donor');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    const { error } = await signUp({ email, password, fullName, role, phone, city });
    if (error) {
      setBusy(false);
      setError(error);
      return;
    }
    await refreshProfile();
    setBusy(false);
    navigate(role === 'ngo' ? '/ngo-register' : '/dashboard');
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-lg">
        <div className="card p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="mt-1 text-sm text-gray-500">
              Join as a food donor or register your NGO.
            </p>
          </div>

          {user && !busy && (
            <p className="mb-4 rounded-lg bg-primary-50 px-4 py-2.5 text-sm text-primary-800">
              You are already logged in — go to your{' '}
              <Link to="/dashboard" className="font-semibold underline">dashboard</Link>.
            </p>
          )}

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('donor')}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 transition-all ${
                  role === 'donor'
                    ? 'border-primary-600 bg-primary-50 text-primary-800'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <UserRound className="h-6 w-6" />
                <span className="text-sm font-semibold">Donor</span>
                <span className="text-xs text-gray-500">I have food to give</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('ngo')}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 transition-all ${
                  role === 'ngo'
                    ? 'border-accent-500 bg-accent-50 text-accent-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Building2 className="h-6 w-6" />
                <span className="text-sm font-semibold">NGO</span>
                <span className="text-xs text-gray-500">We collect & distribute</span>
              </button>
            </div>

            <div>
              <label htmlFor="name" className="label">
                {role === 'ngo' ? 'Your name (contact person)' : 'Full name'}
              </label>
              <input
                id="name"
                type="text"
                required
                className="input"
                placeholder="e.g. Priya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="label">Phone (optional)</label>
                <input
                  id="phone"
                  type="tel"
                  className="input"
                  placeholder="+91 …"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="city" className="label">City (optional)</label>
                <input
                  id="city"
                  type="text"
                  className="input"
                  placeholder="e.g. Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="label">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  className="input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirm" className="label">Confirm password</label>
                <input
                  id="confirm"
                  type="password"
                  required
                  className="input"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? 'Creating account…' : `Sign Up as ${role === 'ngo' ? 'NGO' : 'Donor'}`}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-700 hover:underline">
              Log in
            </Link>
          </p>
        </div>
        {role === 'ngo' && (
          <p className="mt-4 text-center text-sm text-gray-500">
            Next step after signup: complete your NGO profile so NGOs appearing on the map
            can receive donation requests.
          </p>
        )}
      </div>
    </div>
  );
}
