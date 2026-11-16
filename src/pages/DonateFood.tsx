import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HandHeart, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { DONATION_CATEGORIES, UNITS } from '@/lib/types';
import LocationPicker from '@/components/LocationPicker';
import ImageUpload from '@/components/ImageUpload';
import MyDonations from './MyDonations';

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function DonateFood() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState<string>(DONATION_CATEGORIES[0]);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<string>(UNITS[0]);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [availableFrom, setAvailableFrom] = useState(() => toLocalInput(new Date()));
  const [availableUntil, setAvailableUntil] = useState(() =>
    toLocalInput(new Date(Date.now() + 3 * 3600_000))
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (profile?.city && !pickupAddress) setPickupAddress('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      setError('Please log in or create a donor account to donate.');
      return;
    }
    if (lat == null || lng == null) {
      setError('Please click on the map to select your pickup location.');
      return;
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Please enter a valid quantity greater than zero.');
      return;
    }
    if (availableFrom && availableUntil && availableUntil < availableFrom) {
      setError('"Available until" must be after "available from".');
      return;
    }

    setBusy(true);
    const { error: insErr } = await supabase
      .from('donations')
      .insert({
        food_name: foodName.trim(),
        category,
        quantity: qty,
        unit,
        description: description.trim() || null,
        image_url: imageUrl,
        pickup_address: pickupAddress.trim() || 'Pinned on map',
        lat,
        lng,
        available_from: availableFrom ? new Date(availableFrom).toISOString() : null,
        available_until: availableUntil ? new Date(availableUntil).toISOString() : null,
      });
    setBusy(false);

    if (insErr) {
      setError(
        insErr.message.includes('row-level security')
          ? 'Your account needs to be logged in as a donor. NGO accounts should ask a donor to post the food.'
          : `Could not save the donation: ${insErr.message}`
      );
      return;
    }

    setSuccess('Donation posted! NGOs can now see it on the live feed.');
    setFoodName('');
    setQuantity('');
    setDescription('');
    setImageUrl(null);
    setLat(null);
    setLng(null);
    setRefreshKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!user) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-14 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-100 text-primary-700">
          <HandHeart className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-3xl font-bold text-gray-900">Ready to donate food?</h1>
        <p className="mt-3 max-w-md text-gray-600">
          Create a free donor account (or log in) to post surplus food. It takes
          less than a minute and helps NGOs near you feed people faster.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/signup" className="btn-primary">Sign up as donor</Link>
          <Link to="/login" className="btn-outline">Log in</Link>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Just exploring? Try the demo login shown on the login page.
        </p>
      </div>
    );
  }

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Donate Food</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          Fill in what you have, drop a pickup pin on the map, and NGOs nearby
          will be able to accept it within minutes.
        </p>
      </div>

      {success && (
        <div className="mt-6 flex items-start gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card mt-8 space-y-6 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="foodName" className="label">Food name *</label>
            <input
              id="foodName"
              className="input"
              required
              placeholder="e.g. Veg biryani, bread loaves"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="category" className="label">Category *</label>
            <select
              id="category"
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {DONATION_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="quantity" className="label">Quantity *</label>
            <input
              id="quantity"
              className="input"
              type="number"
              min="0.5"
              step="any"
              required
              placeholder="e.g. 40"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="unit" className="label">Unit</label>
            <select id="unit" className="input" value={unit} onChange={(e) => setUnit(e.target.value)}>
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="from" className="label">Available from</label>
            <input
              id="from"
              type="datetime-local"
              className="input"
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="until" className="label">Available until</label>
            <input
              id="until"
              type="datetime-local"
              className="input"
              value={availableUntil}
              onChange={(e) => setAvailableUntil(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="address" className="label">Pickup address / landmark</label>
            <input
              id="address"
              className="input"
              placeholder="e.g. Koramangala 5th Block, near …"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            className="input min-h-24"
            placeholder="Anything NGOs should know: veg/non-veg, packaging, freshness window…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <span className="label">Food photo</span>
          <ImageUpload value={imageUrl} onChange={setImageUrl} disabled={busy} />
        </div>

        <div>
          <span className="label">Pickup location * (click the map)</span>
          <LocationPicker
            lat={lat}
            lng={lng}
            onChange={(newLat, newLng) => {
              setLat(newLat);
              setLng(newLng);
            }}
          />
        </div>

        <button type="submit" disabled={busy} className="btn-primary w-full sm:w-auto">
          <HandHeart className="h-4 w-4" />
          {busy ? 'Posting…' : 'Post Donation'}
        </button>
      </form>

      <section className="mt-14">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Your previous donations</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-semibold text-primary-700 hover:underline"
          >
            View dashboard
          </button>
        </div>
        <div className="mt-6" key={refreshKey}>
          <MyDonations />
        </div>
      </section>
    </div>
  );
}
