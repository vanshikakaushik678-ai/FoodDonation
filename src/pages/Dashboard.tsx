import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  HandHeart,
  PackageCheck,
  Clock,
  UtensilsCrossed,
  Trash2,
  Cloud,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Donation, DonationStatus, Ngo } from '@/lib/types';
import { STATUS_STYLES } from '@/lib/types';
import { aggregateFoodprint, isSample, timeAgo, estimateFoodprint } from '@/lib/utils';
import Spinner from '@/components/Spinner';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'primary',
}: {
  icon: typeof HandHeart;
  label: string;
  value: string;
  sub?: string;
  tone?: 'primary' | 'accent' | 'blue';
}) {
  const tones = {
    primary: 'bg-primary-50 text-primary-700',
    accent: 'bg-accent-50 text-accent-600',
    blue: 'bg-blue-50 text-blue-600',
  };
  return (
    <div className="card flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tones[tone]}`}>
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

export default function Dashboard() {
  const { user, profile, role, loading: authLoading } = useAuth();
  const [donations, setDonations] = useState<Donation[] | null>(null);
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) {
        setError(error.message);
        setDonations([]);
        return;
      }
      setDonations(data ?? []);
      const { data: ngoData } = await supabase.from('ngos').select('*');
      setNgos(ngoData ?? []);
    }
    load();
  }, [user]);

  const mine = useMemo(() => {
    if (!donations) return null;
    if (role === 'ngo') {
      const myNgo = ngos.find((n) => n.user_id === user?.id);
      if (!myNgo) return [];
      return donations.filter(
        (d) => d.accepted_by === myNgo.id && d.status !== 'pending'
      );
    }
    return donations.filter((d) => d.donor_id === user?.id);
  }, [donations, ngos, role, user?.id]);

  if (authLoading) return <Spinner full label="Loading dashboard…" />;

  if (!user || !profile) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-14 text-center">
        <BarChart3 className="h-12 w-12 text-primary-600" />
        <h1 className="mt-5 text-3xl font-bold text-gray-900">Your dashboard awaits</h1>
        <p className="mt-3 max-w-md text-gray-600">
          Log in to see your donation stats, live status tracking and estimated
          impact — or create an account to get started.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/login" className="btn-primary">Log in</Link>
          <Link to="/signup" className="btn-outline">Sign up</Link>
        </div>
      </div>
    );
  }

  if (mine === null) return <Spinner full label="Crunching your numbers…" />;

  const totals = aggregateFoodprint(mine);
  const isDonor = role === 'donor';
  const isNgo = role === 'ngo';
  const myNgo = ngos.find((n) => n.user_id === user.id);

  const statusData = (['pending', 'accepted', 'picked_up', 'completed'] as DonationStatus[])
    .map((s) => ({ name: STATUS_STYLES[s].label, value: mine.filter((d) => d.status === s).length }))
    .filter((x) => x.value > 0);

  const weeklyData = useMemo(() => {
    const days: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      days.push({
        day: d.toLocaleDateString(undefined, { weekday: 'short' }),
        count: mine.filter((x) => new Date(x.created_at).toDateString() === key).length,
      });
    }
    return days;
  }, [mine]);

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary-700">
            {isDonor ? 'Donor dashboard' : 'NGO dashboard'}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Hello, {profile.full_name}
          </h1>
          <p className="mt-1 text-gray-600">
            {isNgo
              ? myNgo
                ? `Managing donations for ${myNgo.org_name}`
                : 'Finish your NGO profile to start accepting donations.'
              : 'Here is the impact of your food donations so far.'}
          </p>
        </div>
        <div className="flex gap-3">
          {isDonor && (
            <Link to="/donate" className="btn-primary text-sm">
              <HandHeart className="h-4 w-4" /> New donation
            </Link>
          )}
          {isNgo && !myNgo && (
            <Link to="/ngo-register" className="btn-accent text-sm">
              Complete NGO profile
            </Link>
          )}
          {isNgo && (
            <Link to="/feed" className="btn-outline text-sm">
              Browse live feed
            </Link>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {isNgo && !myNgo && (
        <div className="mt-6 rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700">
          Your NGO profile is not complete yet —{' '}
          <Link to="/ngo-register" className="font-semibold underline">
            finish registration
          </Link>{' '}
          so your organisation appears on the map and can accept donations.
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={HandHeart} label="Total donations" value={String(totals.totalDonations)} />
        <StatCard icon={Clock} label="Pending / accepted" value={String(totals.pending)} tone="accent" />
        <StatCard icon={PackageCheck} label="Completed" value={String(totals.completed)} tone="blue" />
        <StatCard
          icon={UtensilsCrossed}
          label="Food quantity donated"
          value={`${Math.round(totals.totalQuantity)} total units`}
          sub="Mixed units across donations (approx.)"
        />
        <StatCard
          icon={Trash2}
          label="Est. food waste avoided"
          value={`${totals.kgFood} kg`}
          sub="Approximate estimate"
          tone="accent"
        />
        <StatCard
          icon={Cloud}
          label="Est. meals supported"
          value={`${totals.meals}`}
          sub={`~${totals.co2} kg CO₂e avoided (approx.)`}
          tone="blue"
        />
      </div>

      {/* Charts */}
      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3">
          <h2 className="font-bold text-gray-900">Donations per day (last 7 days)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} name="Donations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-bold text-gray-900">Status breakdown</h2>
          {statusData.length === 0 ? (
            <p className="mt-8 text-center text-sm text-gray-500">No donations yet.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-900">Recent donation activity</h2>
        {mine.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-200 p-10 text-center">
            <Activity className="mx-auto h-9 w-9 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">
              {isDonor ? 'Post your first donation to see activity here.' : 'Accept donations from the live feed to see activity here.'}
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {mine.slice(0, 8).map((d) => {
              const est = estimateFoodprint(d.quantity, d.unit);
              const status = STATUS_STYLES[d.status];
              return (
                <li key={d.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {d.food_name}
                      {isSample(d.food_name) && (
                        <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">Sample</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {d.quantity} {d.unit} · ~{est.meals} meals · posted {timeAgo(d.created_at)}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}>
                    {status.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
