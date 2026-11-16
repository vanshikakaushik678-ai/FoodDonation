import { Link } from 'react-router-dom';
import {
  ArrowRight,
  HandHeart,
  Building2,
  MapPinned,
  Calculator,
  UtensilsCrossed,
  Leaf,
  Users,
  Clock,
} from 'lucide-react';
import LiveFeed from './LiveFeed';

const HERO_IMG =
  'https://images.pexels.com/photos/6591154/pexels-photo-6591154.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const steps = [
  {
    icon: HandHeart,
    title: 'Donors post surplus food',
    text: 'Restaurants, hosts and households list extra food with a photo, quantity and pickup spot in under two minutes.',
  },
  {
    icon: MapPinned,
    title: 'NGOs see it live',
    text: 'Nearby NGOs get the request on the live feed with an interactive map and route to the pickup point.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Food reaches people',
    text: 'An NGO accepts, collects and marks the handover complete — every meal tracked from plate to person.',
  },
];

const stats = [
  { icon: Users, value: '1,200+', label: 'Meals routed (target, demo)' },
  { icon: Building2, value: '15', label: 'Partner NGOs onboard' },
  { icon: Leaf, value: '300 kg', label: 'Food waste avoided' },
  { icon: Clock, value: '< 30 min', label: 'Typical pickup response' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-700">
              <Leaf className="h-4 w-4" />
              Real-time food rescue
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-[3.4rem]">
              Turn surplus food into{' '}
              <span className="relative whitespace-nowrap text-primary-600">
                someone's meal
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 9" fill="none" preserveAspectRatio="none">
                  <path d="M2 7C40 2 120 2 198 6" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
              Food Connect links people and businesses with extra food to nearby
              NGOs that distribute it to those who need it most — live, mapped,
              and tracked end to end.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/donate" className="btn-primary text-base">
                Donate Food
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/ngo-register" className="btn-outline text-base">
                <Building2 className="h-4 w-4" />
                Register your NGO
              </Link>
              <Link to="/feed" className="btn-ghost text-base">
                View live feed
              </Link>
            </div>
          </div>
          <div className="relative animate-fade-in">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary-100/60 blur-2xl" />
            <img
              src={HERO_IMG}
              alt="Volunteers packing food donations"
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl"
              loading="eager"
            />
            <div className="absolute -bottom-5 -left-4 animate-float rounded-2xl bg-white p-4 shadow-lg ring-1 ring-gray-100 sm:-left-8">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-100 text-accent-600">
                  <UtensilsCrossed className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900">40 servings</p>
                  <p className="text-xs text-gray-500">picked up just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50/70">
        <div className="container-page grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-primary-600 shadow-sm ring-1 ring-gray-100">
                <s.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 sm:text-sm">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it helps */}
      <section className="container-page py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">How Food Connect works</h2>
          <p className="mt-3 text-gray-600">
            Three simple steps between surplus and stomach.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="card group relative overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="absolute right-5 top-4 text-5xl font-bold text-gray-100 transition-colors group-hover:text-primary-100">
                {i + 1}
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-600 text-white">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-gray-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/how-it-works" className="inline-flex items-center gap-1.5 font-semibold text-primary-700 hover:underline">
            See the full journey <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Calculator teaser */}
      <section className="bg-primary-900">
        <div className="container-page grid items-center gap-8 py-14 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-800 px-4 py-1.5 text-sm font-semibold text-primary-100">
              <Calculator className="h-4 w-4" />
              Foodprint Calculator
            </span>
            <h2 className="mt-4 text-3xl font-bold text-white">
              See the impact of what you give
            </h2>
            <p className="mt-3 max-w-lg text-primary-100/90">
              Estimate the meals supported, food waste avoided and CO₂ saved
              from your donations. Every figure is clearly labelled as an
              approximation based on standard food-rescue assumptions.
            </p>
            <Link to="/foodprint" className="btn-accent mt-6">
              Try the calculator
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { value: '~', label: 'Meals supported' },
              { value: 'kg', label: 'Waste avoided' },
              { value: 'CO₂', label: 'Emissions saved' },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl bg-primary-800/70 p-6 text-center ring-1 ring-primary-700">
                <p className="font-display text-3xl font-bold text-accent-300">{c.value}</p>
                <p className="mt-1 text-sm text-primary-100">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live feed preview */}
      <LiveFeed preview />
    </div>
  );
}
