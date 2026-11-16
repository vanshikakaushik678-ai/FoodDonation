import { Link } from 'react-router-dom';
import { UtensilsCrossed, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2 max-w-sm">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 text-white">
                <UtensilsCrossed className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-bold text-gray-900">
                Food<span className="text-primary-600">Connect</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              A real-time platform connecting surplus food donors with NGOs that
              feed people in need. Less waste, more meals.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><Link to="/feed" className="hover:text-primary-700">Live Donation Feed</Link></li>
              <li><Link to="/donate" className="hover:text-primary-700">Donate Food</Link></li>
              <li><Link to="/ngo-register" className="hover:text-primary-700">NGO Registration</Link></li>
              <li><Link to="/foodprint" className="hover:text-primary-700">Foodprint Calculator</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary-600" /> hello@foodconnect.org</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary-600" /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary-600" /> Bengaluru, India</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-200 pt-6 text-xs text-gray-500">
          Food Connect — a student-built platform for a zero-waste future.
        </div>
      </div>
    </footer>
  );
}
