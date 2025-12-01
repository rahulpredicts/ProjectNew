import { Button } from "@/components/ui/button";
import { Car, Shield, TrendingUp, Users, ArrowRight, Phone, Mail, MapPin } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Carsellia</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">Dealer Registration</a>
              <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">How It Works</a>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-login"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            The Future of Vehicle Trading
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Accurate, transparent, and efficient. Carsellia empowers dealers with powerful inventory management and appraisal tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
              data-testid="button-dealer-login"
            >
              Dealer Login
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => window.location.href = '/api/login'}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8"
              data-testid="button-admin-login"
            >
              Admin Login
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Carsellia?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Accurate Appraisals</h3>
              <p className="text-slate-400">
                Get precise vehicle valuations powered by comprehensive market data from your own inventory.
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Platform</h3>
              <p className="text-slate-400">
                Enterprise-grade security with role-based access control for admins and dealers.
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Dealership Support</h3>
              <p className="text-slate-400">
                Manage multiple dealerships with comprehensive inventory tracking and reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Sign Up", desc: "Create your dealer account" },
              { step: "2", title: "Add Inventory", desc: "Upload vehicles via CSV or manual entry" },
              { step: "3", title: "Get Appraisals", desc: "AI-powered vehicle valuations" },
              { step: "4", title: "Manage Sales", desc: "Track your inventory and deals" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 py-12 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold">Carsellia</span>
              </div>
              <p className="text-slate-400 text-sm">
                The Future of Vehicle Trading. Accurate, transparent, and efficient.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Buy a Car</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sell a Car</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +919815309269
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  contact@carsellia.com
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ontario, Canada
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400 text-sm">
            © 2025 Carsellia. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
