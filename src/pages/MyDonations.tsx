import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HandHeart, CheckCircle2, MapPin, Clock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Donation, DonationStatus } from '@/lib/types';
import { STATUS_STYLES } from '@/lib/types';
import { isSample, timeAgo } from '@/lib/utils';
import Spinner from '@/components/Spinner';
import Badge from '@/components/Badge';

const FLOW: Partial<Record<DonationStatus, { next: DonationStatus; label: string }>> = {
  accepted: { next: 'picked_up', label: 'Mark Picked Up' },
  picked_up: { next: 'completed', label: 'Mark Completed' },
};

export default function MyDonations() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('donor_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
      setDonations([]);
      return;
    }
    setError(null);
    setDonations(data ?? []);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function advance(d: Donation) {
    const step = FLOW[d.status];
    if (!step) return;
    setBusyId(d.id);
    setMsg(null);
    const patch: Record<string, unknown> = { status: step.next };
    if (step.next === 'completed') patch.completed_at = new Date().toISOString();
    const { error } = await supabase.from('donations').update(patch).eq('id', d.id);
    setBusyId(null);
    if (error) {
      setMsg(`Could not update: ${error.message}`);
      return;
    }
    setMsg(`"${d.food_name}" is now ${STATUS_STYLES[step.next].label}.`);
    load();
  }

  if (!user) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center py-14 text-center">
        <HandHeart className="h-12 w-12 text-primary-600" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Log in to see your donations</h2>
        <p className="mt-2 max-w-sm text-gray-600">
          Your donation history and status tracking live inside your account.
        </p>
        <div className="mt-6 flex gap-3">
          <Link to="/login" className="btn-primary">Log in</Link>
          <Link to="/signup" className="btn-outline">Sign up</Link>
        </div>
      </div>
    );
  }

  if (donations === null) {
    return <Spinner label="Loading your donations…" />;
  }

  return (
    <div>
      {msg && (
        <p className="mb-6 flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-800">
          <CheckCircle2 className="h-4 w-4" /> {msg}
        </p>
      )}
      {error && (
        <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {donations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <HandHeart className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 font-semibold text-gray-700">No donations yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Post your first surplus food donation using the form above.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {donations.map((d) => {
            const status = STATUS_STYLES[d.status];
            const step = FLOW[d.status];
            return (
              <li key={d.id} className="card p-5 transition-shadow hover:shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {d.image_url ? (
                      <img
                        src={d.image_url}
                        alt={d.food_name}
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-400">
                        <HandHeart className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {d.food_name}
                        {isSample(d.food_name) && (
                          <span className="ml-2 align-middle">
                            <Badge>Sample</Badge>
                          </span>
                        )}
                      </h3>
                      <p className="mt-0.5 text-sm text-gray-600">
                        {d.quantity} {d.unit} · {d.category}
                      </p>
                      <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {d.pickup_address}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> Posted {timeAgo(d.created_at)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}>
                      {status.label}
                    </span>
                    {step && (
                      <button
                        onClick={() => advance(d)}
                        disabled={busyId === d.id}
                        className="btn-primary !px-4 !py-2 text-xs"
                      >
                        {step.label}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
