import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, AlertCircle, MapPinned } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Ngo } from '@/lib/types';
import LocationPicker from '@/components/LocationPicker';
import Spinner from '@/components/Spinner';

export default function NgoRegister() {
  const { user, role, profile } = useAuth();
  const [existing, setExisting] = useState<Ngo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [orgName, setOrgName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('ngos')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setExisting(data);
        setOrgName(data.org_name ?? '');
        setContactPerson(data.contact_person ?? '');
        setPhone(data.phone ?? '');
        setEmail(data.email ?? '');
        setAddress(data.address ?? '');
        setCity(data.city ?? '');
        setDescription(data.description ?? '');
        setLat(data.lat);
        setLng(data.lng);
      } else if (profile) {
        setContactPerson(profile.full_name);
        setPhone(profile.phone ?? '');
        setCity(profile.city ?? '');
        setEmail(user.email ?? '');
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!user) {
      setError('Please log in with an NGO account first (sign up choosing the NGO role).');
      return;
    }
    if (lat == null || lng == null) {
      setError('Please click the map to place your NGO location pin.');
      return;
    }
    setSaving(true);
    const payload = {
      user_id: user.id,
      org_name: orgName.trim(),
      contact_person: contactPerson.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
      city: city.trim() || null,
      description: description.trim() || null,
      lat,
      lng,
    };
    const { error: err } = existing
      ? await supabase.from('ngos').update(payload).eq('id', existing.id)
      : await supabase.from('ngos').insert(payload);
    setSaving(false);
    if (err) {
      setError(
        err.message.includes('row-level security')
          ? 'Only the NGO account that owns this profile can save it. Make sure you are logged in with the correct account.'
          : `Could not save: ${err.message}`
      );
      return;
    }
    setSuccess(
      existing
        ? 'NGO profile updated. Your changes are live on the map.'
        : 'NGO registered! Your organisation now appears on the map and can accept donations on the live feed.'
    );
    if (!existing) {
      const { data } = await supabase.from('ngos').select('*').eq('user_id', user.id).maybeSingle();
      setExisting(data ?? null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (loading) return <Spinner full label="Checking NGO profile…" />;

  if (!user) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-14 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-100 text-accent-600">
          <Building2 className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-3xl font-bold text-gray-900">Register your NGO</h1>
        <p className="mt-3 max-w-md text-gray-600">
          First create an NGO account (choose "NGO" at signup), then complete
          your organisation profile so you can accept food donations near you.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/signup" className="btn-accent">Sign up as NGO</Link>
          <Link to="/login" className="btn-outline">Log in</Link>
        </div>
      </div>
    );
  }

  if (role && role !== 'ngo') {
    return (
      <div className="container-page max-w-xl py-14 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">You are signed in as a Donor</h1>
        <p className="mt-2 text-gray-600">
          NGO profiles are tied to accounts that registered with the NGO role.
          Sign up a new NGO account to register your organisation.
        </p>
        <Link to="/dashboard" className="btn-primary mt-6">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {existing ? 'NGO Profile' : 'NGO Registration'}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          {existing
            ? 'Update your organisation details below — changes show up on the live map immediately.'
            : 'Complete your organisation profile. Once saved, your NGO appears on the map and can accept donations from the live feed.'}
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
            <label htmlFor="orgName" className="label">Organisation name *</label>
            <input
              id="orgName"
              className="input"
              required
              placeholder="e.g. Hope Foundation"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="contactPerson" className="label">Contact person</label>
            <input
              id="contactPerson"
              className="input"
              placeholder="e.g. Meera Nair"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="label">Phone</label>
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
            <label htmlFor="email" className="label">Contact email</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="care@yourngo.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="label">City</label>
            <input
              id="city"
              className="input"
              placeholder="e.g. Bengaluru"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="address" className="label">Address</label>
            <input
              id="address"
              className="input"
              placeholder="Street, area"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="label">About the NGO</label>
          <textarea
            id="description"
            className="input min-h-24"
            placeholder="Who you serve, areas covered, capacity…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <span className="label">NGO location * (click the map)</span>
          <LocationPicker
            lat={lat}
            lng={lng}
            onChange={(newLat, newLng) => {
              setLat(newLat);
              setLng(newLng);
            }}
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
          <MapPinned className="h-4 w-4" />
          {saving ? 'Saving…' : existing ? 'Save changes' : 'Register NGO'}
        </button>
      </form>
    </div>
  );
}
