import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Car, Shield, TrendingUp, Users, ArrowRight, Phone, Mail, MapPin, ShoppingCart, DollarSign, Calculator, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'appraise' | null>(null);

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
            
            {/* Main Navigation Tabs */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={activeTab === 'buy' ? 'default' : 'ghost'}
                onClick={() => setActiveTab(activeTab === 'buy' ? null : 'buy')}
                className={activeTab === 'buy' ? 'bg-blue-600' : 'text-slate-300 hover:text-white'}
                data-testid="nav-buy-cars"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Cars
              </Button>
              <Button
                variant={activeTab === 'sell' ? 'default' : 'ghost'}
                onClick={() => setActiveTab(activeTab === 'sell' ? null : 'sell')}
                className={activeTab === 'sell' ? 'bg-green-600' : 'text-slate-300 hover:text-white'}
                data-testid="nav-sell-cars"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Sell Cars
              </Button>
              <Button
                variant={activeTab === 'appraise' ? 'default' : 'ghost'}
                onClick={() => setActiveTab(activeTab === 'appraise' ? null : 'appraise')}
                className={activeTab === 'appraise' ? 'bg-purple-600' : 'text-slate-300 hover:text-white'}
                data-testid="nav-appraise"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Appraise
              </Button>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost"
                onClick={() => window.location.href = '/api/login'}
                className="text-slate-300 hover:text-white"
                data-testid="button-register"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Register
              </Button>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-login"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden flex justify-center gap-2 p-4 bg-slate-800/50">
        <Button
          size="sm"
          variant={activeTab === 'buy' ? 'default' : 'outline'}
          onClick={() => setActiveTab(activeTab === 'buy' ? null : 'buy')}
          className={activeTab === 'buy' ? 'bg-blue-600' : 'border-slate-600'}
        >
          Buy
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'sell' ? 'default' : 'outline'}
          onClick={() => setActiveTab(activeTab === 'sell' ? null : 'sell')}
          className={activeTab === 'sell' ? 'bg-green-600' : 'border-slate-600'}
        >
          Sell
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'appraise' ? 'default' : 'outline'}
          onClick={() => setActiveTab(activeTab === 'appraise' ? null : 'appraise')}
          className={activeTab === 'appraise' ? 'bg-purple-600' : 'border-slate-600'}
        >
          Appraise
        </Button>
      </div>

      {/* Tab Info Sections */}
      {activeTab && (
        <section className="py-12 px-4 bg-slate-800/30 border-b border-slate-700">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'buy' && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-400">
                    <ShoppingCart className="w-6 h-6" />
                    Buy Cars
                  </CardTitle>
                  <CardDescription>Find your next vehicle from trusted dealers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300">
                    Browse thousands of quality vehicles from verified dealerships across Canada. 
                    Our platform connects you with trusted sellers offering competitive prices.
                  </p>
                  <ul className="space-y-2 text-slate-400">
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-400" />
                      Verified dealership network
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      Market-competitive pricing
                    </li>
                    <li className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-purple-400" />
                      Wide selection of makes and models
                    </li>
                  </ul>
                  <Button 
                    onClick={() => window.location.href = '/api/login'}
                    className="bg-blue-600 hover:bg-blue-700 mt-4"
                  >
                    Sign In to Browse Inventory
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'sell' && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <DollarSign className="w-6 h-6" />
                    Sell Cars
                  </CardTitle>
                  <CardDescription>List your inventory for maximum exposure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300">
                    Reach buyers across Canada and beyond. List vehicles for retail or wholesale, 
                    and let our platform connect you with serious buyers.
                  </p>
                  <ul className="space-y-2 text-slate-400">
                    <li className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-400" />
                      Access to dealer and wholesale networks
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      Optimal pricing recommendations
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-yellow-400" />
                      Secure transaction support
                    </li>
                  </ul>
                  <Button 
                    onClick={() => window.location.href = '/api/login'}
                    className="bg-green-600 hover:bg-green-700 mt-4"
                  >
                    Sign In to List Vehicles
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'appraise' && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-400">
                    <Calculator className="w-6 h-6" />
                    Appraise Vehicles
                  </CardTitle>
                  <CardDescription>Get accurate trade-in and market values</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300">
                    Our appraisal tool provides accurate trade-in values based on your inventory data. 
                    Get retail and wholesale price suggestions based on location and market conditions.
                  </p>
                  <ul className="space-y-2 text-slate-400">
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      Trade-in value suggestions
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      Location-based retail pricing
                    </li>
                    <li className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      Wholesale pricing with shipping considerations
                    </li>
                  </ul>
                  <Button 
                    onClick={() => window.location.href = '/api/login'}
                    className="bg-purple-600 hover:bg-purple-700 mt-4"
                  >
                    Sign In to Use Appraisal Tool
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900/30 z-0" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            The Future of Vehicle Trading
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Accurate, transparent, and efficient. Carsellia empowers dealers with powerful inventory management, appraisal tools, and market insights.
          </p>
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
                Get precise vehicle valuations powered by comprehensive market data with retail and wholesale pricing.
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Platform</h3>
              <p className="text-slate-400">
                Enterprise-grade security with role-based access control for admins, dealers, and data analysts.
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Dealership Support</h3>
              <p className="text-slate-400">
                Manage multiple dealerships with comprehensive inventory tracking, export, and reporting.
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
              { step: "1", title: "Register", desc: "Create your dealer account" },
              { step: "2", title: "Add Inventory", desc: "Upload vehicles via CSV or manual entry" },
              { step: "3", title: "Appraise", desc: "Get trade-in and market values" },
              { step: "4", title: "Trade", desc: "List for retail or wholesale" },
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
                <li><button onClick={() => setActiveTab('buy')} className="hover:text-white transition-colors">Buy a Car</button></li>
                <li><button onClick={() => setActiveTab('sell')} className="hover:text-white transition-colors">Sell a Car</button></li>
                <li><button onClick={() => setActiveTab('appraise')} className="hover:text-white transition-colors">Appraise</button></li>
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

          {/* Login Buttons */}
          <div className="border-t border-slate-700 mt-8 pt-8">
            <h4 className="font-semibold mb-4 text-center">Admin & Data Analyst Access</h4>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                variant="outline"
                onClick={() => window.location.href = '/api/login'}
                className="border-purple-600 text-purple-300 hover:bg-purple-800/20 px-6"
                data-testid="button-analyst-login"
              >
                Data Analyst Login
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => window.location.href = '/api/login'}
                className="border-yellow-600 text-yellow-300 hover:bg-yellow-800/20 px-6"
                data-testid="button-admin-login"
              >
                Admin Login
              </Button>
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
