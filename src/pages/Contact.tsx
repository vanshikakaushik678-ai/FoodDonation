import { useState, type FormEvent } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ContactMessage } from '@/lib/types';

export default function Contact() {
  const [form, setForm] = useState<ContactMessage>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof ContactMessage>(key: K, value: ContactMessage[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: (form.subject ?? '').trim() || null,
      message: form.message.trim(),
    });
    setBusy(false);
    if (error) {
      setError(`Could not send your message: ${error.message}`);
      return;
    }
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  }

  return (
    <div className="container-page max-w-5xl py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-lg text-gray-600">
          Questions about donating, partnering as an NGO, or using the
          platform? Send us a message — we usually reply within a day.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {[
            { icon: Mail, title: 'Email', text: 'hello@foodconnect.org' },
            { icon: Phone, title: 'Phone', text: '+91 98765 43210' },
            { icon: MapPin, title: 'Office', text: 'Food Connect, Bengaluru, India' },
          ].map((c) => (
            <div key={c.title} className="card flex items-center gap-4 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700">
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900">{c.title}</p>
                <p className="text-sm text-gray-600">{c.text}</p>
              </div>
            </div>
          ))}
          <div className="card bg-primary-900 p-6 text-primary-50">
            <h3 className="font-bold text-white">Want to partner as an NGO?</h3>
            <p className="mt-1.5 text-sm text-primary-100/90">
              Register directly on the platform — it takes two minutes and your
              team can start collecting donations the same day.
            </p>
            <a href="/ngo-register" className="btn-accent mt-4 !px-4 !py-2 text-sm">
              NGO Registration
            </a>
          </div>
        </div>

        <div className="lg:col-span-3">
          {sent && (
            <div className="mb-5 flex items-start gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Thanks! Your message has been received — we'll get back to you soon.</span>
            </div>
          )}
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="card space-y-5 p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="label">Your name *</label>
                <input
                  id="name"
                  className="input"
                  required
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="label">Email *</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  required
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="label">Subject</label>
              <input
                id="subject"
                className="input"
                value={form.subject ?? ''}
                onChange={(e) => set('subject', e.target.value)}
                placeholder="What is this about?"
              />
            </div>
            <div>
              <label htmlFor="message" className="label">Message *</label>
              <textarea
                id="message"
                className="input min-h-36"
                required
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                placeholder="Tell us more…"
              />
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full sm:w-auto">
              <Send className="h-4 w-4" />
              {busy ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
