import { Link } from 'react-router-dom';
import {
  UserRound,
  Building2,
  ClipboardList,
  BellRing,
  Truck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const donorSteps = [
  {
    icon: ClipboardList,
    title: 'Post your donation',
    text: 'Add the food name, category, quantity, a photo, and drop a pin on the map for your pickup location. Set when the food is available.',
  },
  {
    icon: BellRing,
    title: 'Get matched live',
    text: 'Your donation appears instantly on the live feed where nearby NGOs can see and accept it. You can watch the status move from Pending to Accepted.',
  },
  {
    icon: CheckCircle2,
    title: 'Hand over & see impact',
    text: 'An NGO volunteer collects the food at your pickup point and marks it picked up, then completed. Your dashboard shows meals supported and waste avoided.',
  },
];

const ngoSteps = [
  {
    icon: Building2,
    title: 'Register your NGO',
    text: 'Create an NGO account, add your organisation profile, address and map location so donors near you can find you.',
  },
  {
    icon: UserRound,
    title: 'Monitor the live feed',
    text: 'Filter available donations by location, category and availability. Accept the ones your team can collect in time.',
  },
  {
    icon: Truck,
    title: 'Collect & update status',
    text: 'Open the pickup point on the map for route guidance, collect the food, then update the status — picked up, then completed after distribution.',
  },
];

function StepColumn({
  heading,
  subheading,
  steps,
  accent,
}: {
  heading: string;
  subheading: string;
  steps: typeof donorSteps;
  accent: boolean;
}) {
  return (
    <div className="card overflow-hidden">
      <div className={`p-6 ${accent ? 'bg-accent-500' : 'bg-primary-600'}`}>
        <h2 className="text-xl font-bold text-white">{heading}</h2>
        <p className="mt-1 text-sm text-white/85">{subheading}</p>
      </div>
      <ol className="relative space-y-8 p-6">
        {steps.map((s, i) => (
          <li key={s.title} className="relative flex gap-4">
            {i < steps.length - 1 && (
              <span className="absolute left-6 top-14 h-[calc(100%-1.5rem)] w-0.5 bg-gray-100" />
            )}
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white ${
                accent ? 'bg-accent-100 text-accent-600' : 'bg-primary-100 text-primary-700'
              }`}
            >
              <s.icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-bold text-gray-900">
                {i + 1}. {s.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="border-t border-gray-100 p-6">
        <Link
          to={accent ? '/ngo-register' : '/donate'}
          className={`inline-flex items-center gap-1.5 font-semibold ${
            accent ? 'text-accent-600' : 'text-primary-700'
          } hover:underline`}
        >
          {accent ? 'Register your NGO' : 'Donate food now'} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <div>
      <section className="container-page py-14 text-center">
        <span className="inline-block rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-700">
          How It Works
        </span>
        <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-bold text-gray-900">
          From surplus to served in three steps
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
          The same live pipeline powers both sides — donors and NGOs — with the
          database keeping every status in sync in real time.
        </p>
      </section>

      <section className="container-page grid gap-8 pb-16 lg:grid-cols-2">
        <StepColumn
          heading="For Donors"
          subheading="Restaurants, caterers, event hosts and households"
          steps={donorSteps}
          accent={false}
        />
        <StepColumn
          heading="For NGOs"
          subheading="Registered organisations that distribute food"
          steps={ngoSteps}
          accent
        />
      </section>

      <section className="bg-primary-900 py-14">
        <div className="container-page text-center">
          <h2 className="text-3xl font-bold text-white">Ready to rescue food?</h2>
          <p className="mx-auto mt-2 max-w-lg text-primary-100/90">
            Create a free account and post your first donation in the next five
            minutes — or browse the live feed to see what's being shared right now.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/signup" className="btn-accent">Create account</Link>
            <Link to="/feed" className="btn-outline !border-primary-300 !bg-transparent !text-primary-100 hover:!bg-primary-800">
              View live feed
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
