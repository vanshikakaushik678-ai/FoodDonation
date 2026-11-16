import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import About from '@/pages/About';
import HowItWorks from '@/pages/HowItWorks';
import DonateFood from '@/pages/DonateFood';
import NgoRegister from '@/pages/NgoRegister';
import LiveFeed from '@/pages/LiveFeed';
import FoodprintCalculator from '@/pages/FoodprintCalculator';
import Dashboard from '@/pages/Dashboard';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/donate" element={<DonateFood />} />
              <Route path="/ngo-register" element={<NgoRegister />} />
              <Route path="/feed" element={<LiveFeed />} />
              <Route path="/foodprint" element={<FoodprintCalculator />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
