import { Link } from 'react-router-dom';
import { Target, Eye, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';

const IMG_SORTING =
  'https://images.pexels.com/photos/6994982/pexels-photo-6994982.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const IMG_SERVING =
  'https://images.pexels.com/photos/6646987/pexels-photo-6646987.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const values = [
  {
    icon: HeartHandshake,
    title: 'Dignity first',
    text: 'Every handoff is treated as hospitality, not charity — food is picked up promptly and respectfully.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety & trust',
    text: 'Verified NGO accounts, clear pickup windows and transparent status tracking on every donation.',
  },
  {
    icon: Sparkles,
    title: 'Zero waste mindset',
    text: 'We measure our impact openly — meals served, kilograms rescued and emissions avoided.',
  },
];

export default function About() {
  return (
    <div>
      <section className="container-page py-14 text-center">
        <span className="inline-block rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-700">
          About Us
        </span>
        <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-bold text-gray-900">
          We exist so that good food never goes to waste while people go hungry
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
          Food Connect is a student-built, real-time food donation platform.
          It bridges the gap between those with surplus food — weddings,
          restaurants, canteens, households — and the NGOs that can deliver it
          to people in need within hours, not days.
        </p>
      </section>

      <section className="container-page grid items-center gap-10 pb-16 lg:grid-cols-2">
        <img
          src={IMG_SORTING}
          alt="Volunteers sorting food donations"
          className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lg"
          loading="lazy"
        />
        <div>
          <div className="flex gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-600 text-white">
              <Target className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Our mission</h2>
              <p className="mt-2 leading-relaxed text-gray-600">
                Make food rescue as easy as ordering a cab: post in a minute,
                match in minutes, feed people the same day.
              </p>
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-500 text-white">
              <Eye className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Our vision</h2>
              <p className="mt-2 leading-relaxed text-gray-600">
                A city where every event, canteen and household checks Food
                Connect before the bin — and a dashboard that proves the impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="container-page">
          <h2 className="text-center text-3xl font-bold text-gray-900">What we stand for</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="card p-7 transition-shadow hover:shadow-md">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-100 text-primary-700">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Built as a demonstration of what tech can do</h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              Food Connect was designed and built end to end as a final-year
              engineering project: a real backend with secure accounts, a live
              donation feed, interactive maps and impact analytics. Sample
              entries in the feed are always marked so you can tell them apart
              from live donations.
            </p>
            <Link to="/how-it-works" className="btn-primary mt-6">
              See how the platform works
            </Link>
          </div>
          <img
            src={IMG_SERVING}
            alt="Volunteer serving food at a community event"
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lg"
            loading="lazy"
          />
        </div>
      </section>
    </div>
  );
}
