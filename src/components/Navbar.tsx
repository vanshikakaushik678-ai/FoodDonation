import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/feed', label: 'Live Feed' },
  { to: '/foodprint', label: 'Foodprint' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur shadow-md shadow-gray-900/5' : 'bg-white'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 text-white">
            <UtensilsCrossed className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-gray-900">
            Food<span className="text-primary-600">Connect</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {publicLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {user && profile ? (
            <>
              <Link
                to="/dashboard"
                className="btn-outline !px-4 !py-2 text-sm"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="btn-ghost !px-3 !py-2 text-sm"
                title={`Log out ${profile.full_name}`}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost !px-4 !py-2 text-sm">
                <UserIcon className="h-4 w-4" />
                Login
              </Link>
              <Link to="/donate" className="btn-primary !px-5 !py-2 text-sm">
                Donate Food
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 animate-fade-in">
          <div className="flex flex-col gap-1">
            {publicLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'text-primary-700 bg-primary-50' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-3">
              {user && profile ? (
                <>
                  <Link to="/dashboard" className="btn-outline w-full" onClick={() => setOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="btn-ghost w-full">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost w-full" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                  <Link to="/donate" className="btn-primary w-full" onClick={() => setOpen(false)}>
                    Donate Food
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
