import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Search,
  HandHeart,
  XCircle,
  Navigation,
  RefreshCw,
  Info,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import type { Donation, Ngo } from '@/lib/types';
import { DONATION_CATEGORIES, STATUS_STYLES } from '@/lib/types';
import { isSample, timeAgo } from '@/lib/utils';
import MapView from '@/components/MapView';
import Spinner from '@/components/Spinner';
import Badge from '@/components/Badge';

interface Filters {
  search: string;
  category: string;
  status: string;
  city: string;
}

const emptyFilters: Filters = { search: '', category: 'All', status: 'All', city: 'All' };

export default function LiveFeed({ preview = false }: { preview?: boolean }) {
  const { user, role } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [actingId, setActingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [myNgo, setMyNgo] = useState<Ngo | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const initialized = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      const [donRes, ngoRes] = await Promise.all([
        supabase.from('donations').select('*').order('created_at', { ascending: false }).limit(60),
        supabase.from('ngos').select('*').order('created_at', { ascending: false }),
      ]);
      if (donRes.error) throw donRes.error;
      if (ngoRes.error) throw ngoRes.error;
      setDonations(donRes.data ?? []);
      setNgos(ngoRes.data ?? []);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the live feed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    async function loadMyNgo() {
      if (!user || role !== 'ngo') {
        setMyNgo(null);
        return;
      }
      const { data } = await supabase
        .from('ngos')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      setMyNgo(data ?? null);
    }
    loadMyNgo();
  }, [user, role]);

  const cities = useMemo(
    () => Array.from(new Set(ngos.map((n) => n.city).filter(Boolean))) as string[],
    [ngos]
  );

  const filtered = useMemo(() => {
    return donations.filter((d) => {
      if (filters.category !== 'All' && d.category !== filters.category) return false;
      if (filters.status !== 'All' && d.status !== filters.status) return false;
      if (filters.search && !`${d.food_name} ${d.pickup_address}`.toLowerCase().includes(filters.search.toLowerCase()))
        return false;
      if (filters.city !== 'All') {
        const near = ngos.some(
          (n) => n.city === filters.city && Number.isFinite(d.lat) && Number.isFinite(d.lng)
        );
        if (!near && !d.pickup_address.toLowerCase().includes(filters.city.toLowerCase()))
          return false;
      }
      return true;
    });
  }, [donations, filters, ngos]);

  async function updateStatus(donation: Donation, status: 'accepted' | 'rejected') {
    if (!myNgo) return;
    setActingId(donation.id);
    setActionMsg(null);
    const { error } = await supabase
      .from('donations')
      .update({
        status,
        accepted_by: status === 'accepted' ? myNgo.id : null,
        accepted_at: status === 'accepted' ? new Date().toISOString() : null,
      })
      .eq('id', donation.id);
    setActingId(null);
    if (error) {
      setActionMsg(
        error.message.includes('row-level security')
          ? 'You need a completed NGO profile (registered & logged in as NGO) to accept donations.'
          : `Could not update: ${error.message}`
      );
      return;
    }
    setActionMsg(
      status === 'accepted'
        ? `You accepted "${donation.food_name}". It is now marked Accepted.`
        : `You declined "${donation.food_name}".`
    );
    fetchData();
  }

  const showFilters = !preview;

  return (
    <section className={preview ? 'container-page py-16' : 'container-page py-10'}>
      <div className={`flex flex-wrap items-end justify-between gap-4 ${preview ? '' : 'pt-4'}`}>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {preview ? 'Live right now' : 'Live Donation Feed'}
          </h2>
          <p className="mt-2 max-w-xl text-gray-600">
            {preview
              ? 'A snapshot of what the community is sharing. Open the full feed to filter and, as an NGO, accept donations.'
              : 'Surplus food posted by donors across the city. NGO accounts can accept pending donations directly.'}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString()}</span>}
          {!preview && (
            <button onClick={fetchData} className="btn-ghost !px-3 !py-1.5 text-sm">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          )}
          {preview && (
            <Link to="/feed" className="btn-outline !px-4 !py-2 text-sm">
              Open full feed
            </Link>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="mt-6 grid gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="input !pl-9"
              placeholder="Search food or area…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
          </div>
          <select
            className="input"
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          >
            <option value="All">All categories</option>
            {DONATION_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="input"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="All">Any status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="picked_up">Picked Up</option>
            <option value="completed">Completed</option>
          </select>
          <select
            className="input"
            value={filters.city}
            onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
          >
            <option value="All">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {actionMsg && (
        <p className="mt-6 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-800">{actionMsg}</p>
      )}

      {loading ? (
        <Spinner label="Loading live feed…" />
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <HandHeart className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 font-semibold text-gray-700">No donations match your filters yet</p>
          <p className="mt-1 text-sm text-gray-500">
            {preview ? 'Check back soon or' : 'Be the first —'}{' '}
            <Link to="/donate" className="font-semibold text-primary-700 hover:underline">
              post a donation
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(0, preview ? 6 : undefined).map((d) => {
              const status = STATUS_STYLES[d.status];
              const canAccept = role === 'ngo' && d.status === 'pending';
              const canManage =
                role === 'ngo' &&
                myNgo != null &&
                d.accepted_by === myNgo.id &&
                ['accepted', 'picked_up'].includes(d.status);
              return (
                <article key={d.id} className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-44 bg-gray-100">
                    {d.image_url ? (
                      <img
                        src={d.image_url}
                        alt={d.food_name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-gray-300">
                        <HandHeart className="h-10 w-10" />
                      </div>
                    )}
                    <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${status.badge}`}>
                      {status.label}
                    </span>
                    {isSample(d.food_name) && (
                      <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-600">
                        Sample data
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-bold text-gray-900">{d.food_name}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {d.quantity} {d.unit} · {d.category}
                    </p>
                    <div className="mt-3 space-y-1.5 text-sm text-gray-500">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-primary-600" />
                        <span className="line-clamp-1">{d.pickup_address}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0 text-primary-600" />
                        Posted {timeAgo(d.created_at)}
                      </p>
                    </div>
                    {d.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-gray-500">{d.description}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2 pt-2">
                      {canAccept && (
                        <>
                          <button
                            onClick={() => updateStatus(d, 'accepted')}
                            disabled={actingId === d.id}
                            className="btn-primary !px-4 !py-2 text-xs"
                          >
                            <HandHeart className="h-4 w-4" />
                            Accept Donation
                          </button>
                          <button
                            onClick={() => updateStatus(d, 'rejected')}
                            disabled={actingId === d.id}
                            className="btn-ghost !px-3 !py-2 text-xs text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                            Decline
                          </button>
                        </>
                      )}
                      {canManage && (
                        <Badge variant="primary">Assigned to your NGO</Badge>
                      )}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline !px-4 !py-2 text-xs"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        Route
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {!preview && role !== 'ngo' && filtered.some((d) => d.status === 'pending') && (
            <p className="mt-6 flex items-start gap-2 rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Accept buttons appear for logged-in NGO accounts.{' '}
                <Link to="/ngo-register" className="font-semibold underline">
                  Register your NGO
                </Link>{' '}
                to start collecting.
              </span>
            </p>
          )}
          {!preview && (
            <div className="mt-10">
              <h3 className="mb-4 text-xl font-bold text-gray-900">Pickup map</h3>
              <MapView donations={filtered} ngos={ngos} />
              <p className="mt-2 text-xs text-gray-500">
                Green pins: donation pickup points. Orange dots: registered NGOs. Click a pin,
                then "Get route guidance" to open turn-by-turn directions.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
