import { 
  Car, 
  Users, 
  Package, 
  ClipboardCheck, 
  Globe, 
  Truck, 
  MapPin,
  Shield,
  Database,
  Calculator,
  Clock,
  DollarSign,
  Download,
  Zap,
  BarChart3,
  CheckCircle,
  FileText,
  Upload,
  Search,
  Lock,
  Settings,
  TrendingUp,
  Building,
  Phone,
  Mail,
  MapPinned,
  Star,
  Award,
  Target,
  Gauge,
  Wrench,
  AlertTriangle,
  XCircle,
  Sparkles,
  Bot,
  Link,
  FileSpreadsheet,
  Route,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrochurePage() {
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm 10mm;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-page {
            background: white !important;
            color: #0f172a !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          
          .print-page * {
            color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .print-header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .print-section {
            page-break-inside: avoid;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .feature-card {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .pricing-row:nth-child(even) {
            background: #f1f5f9 !important;
          }
          
          aside, nav, header:not(.print-header), .sidebar {
            display: none !important;
          }
        }
        
        @media screen {
          .print-page {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-slate-100 py-8 print:py-0 print:bg-white">
        <div className="no-print fixed top-4 right-4 z-50">
          <Button 
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            data-testid="button-download-pdf"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
        
        <div className="print-page">
          {/* PAGE 1: Cover & Overview */}
          <header className="print-header bg-gradient-to-br from-slate-900 to-slate-800 text-white px-8 py-12 print:py-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-600 p-4 rounded-xl">
                <Car className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-5xl font-bold tracking-tight" data-testid="text-brand-name">Carsellia</h1>
                <p className="text-blue-400 text-xl font-medium mt-2" data-testid="text-tagline">
                  Vehicle Trading & Dealership Management Platform
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-8">
              <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
                <p className="text-3xl font-bold text-blue-400">100K+</p>
                <p className="text-slate-400 text-sm">Concurrent Users</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
                <p className="text-3xl font-bold text-green-400">34,000+</p>
                <p className="text-slate-400 text-sm">Vehicle Inventory</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
                <p className="text-3xl font-bold text-amber-400">21</p>
                <p className="text-slate-400 text-sm">Canadian Cities</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
                <p className="text-3xl font-bold text-purple-400">4</p>
                <p className="text-slate-400 text-sm">User Roles</p>
              </div>
            </div>
          </header>

          <section className="print-section px-8 py-8 bg-white" data-testid="section-overview">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BarChart3 className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Platform Overview</h2>
                <p className="text-slate-600 text-base leading-relaxed mb-4" data-testid="text-platform-description">
                  Carsellia is a comprehensive, production-ready vehicle trading and dealership management platform 
                  designed to support <span className="font-semibold text-blue-600">100,000+ concurrent users</span>. 
                  Built with enterprise-grade security, the platform provides secure authentication with role-based 
                  access control, comprehensive vehicle inventory management, and advanced AI-powered tools 
                  for the Canadian automotive industry.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700 text-sm">Enterprise-grade security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700 text-sm">Real-time data synchronization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700 text-sm">AI-powered analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700 text-sm">Canadian market focus</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ROLE-BASED ACCESS CONTROL */}
          <section className="print-section px-8 py-6 bg-slate-50" data-testid="section-roles">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              Role-Based Access Control
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              Four distinct user roles with specific permissions tailored to job functions:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Settings className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Administrator</h3>
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Full system access & configuration</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> User management (create, delete, roles)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Password resets for all users</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Access to all platform features</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Dealer</h3>
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Vehicle appraisal & grading</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> View inventory & pricing</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Export profit calculator</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Transport quotes & booking</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Upload className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Data Analyst</h3>
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Bulk vehicle uploads (CSV)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> URL scraping imports</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> AI text parsing</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Data publishing & deletion</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Transportation</h3>
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Transport dashboard & orders</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Quote calculator access</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Fleet & driver management</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Delivery tracking updates</li>
                </ul>
              </div>
            </div>
          </section>

          {/* PAGE 2: Vehicle Inventory & Appraisal */}
          <div className="page-break"></div>
          
          <section className="print-section px-8 py-8 bg-white" data-testid="section-inventory">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Package className="w-6 h-6 text-blue-600" />
              Vehicle Inventory Management
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              Comprehensive vehicle tracking with 34,000+ vehicles across multiple dealerships:
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <Search className="w-6 h-6 text-blue-600 mb-2" />
                <h3 className="font-semibold text-slate-900 text-sm mb-1">Advanced Search</h3>
                <p className="text-xs text-slate-600">Multi-criteria filtering by make, model, year, price, mileage, and status</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <FileText className="w-6 h-6 text-blue-600 mb-2" />
                <h3 className="font-semibold text-slate-900 text-sm mb-1">Complete Vehicle Data</h3>
                <p className="text-xs text-slate-600">VIN, specs, features, Carfax links, listing URLs, and detailed descriptions</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <TrendingUp className="w-6 h-6 text-blue-600 mb-2" />
                <h3 className="font-semibold text-slate-900 text-sm mb-1">Real-Time Status</h3>
                <p className="text-xs text-slate-600">Available, Sold, Pending status tracking with live updates</p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">Vehicle Data Fields:</h4>
              <div className="grid grid-cols-4 gap-2 text-xs text-blue-800">
                <span>• VIN Number</span>
                <span>• Make & Model</span>
                <span>• Trim Level</span>
                <span>• Year</span>
                <span>• Price (CAD)</span>
                <span>• Kilometers</span>
                <span>• Transmission</span>
                <span>• Fuel Type</span>
                <span>• Drivetrain</span>
                <span>• Engine Details</span>
                <span>• Exterior Color</span>
                <span>• Interior Color</span>
                <span>• Body Style</span>
                <span>• Features List</span>
                <span>• Carfax Link</span>
                <span>• Listing URL</span>
              </div>
            </div>
          </section>

          {/* CARSELLIA GRADE APPRAISAL */}
          <section className="print-section px-8 py-6 bg-slate-50" data-testid="section-appraisal">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
              Carsellia Grade Appraisal System
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              Professional vehicle condition classification with VIN decoding and market analysis:
            </p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-lg p-3 border-2 border-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-700">Grade 1: Excellent</span>
                </div>
                <p className="text-xs text-slate-600">Like new condition. No visible defects, minimal wear. Premium pricing justified.</p>
              </div>
              <div className="bg-white rounded-lg p-3 border-2 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-blue-700">Grade 2: Good</span>
                </div>
                <p className="text-xs text-slate-600">Minor cosmetic wear only. Well-maintained, fully functional. Above average value.</p>
              </div>
              <div className="bg-white rounded-lg p-3 border-2 border-yellow-500">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-yellow-700">Grade 3: Fair</span>
                </div>
                <p className="text-xs text-slate-600">Average condition with visible wear. May need minor repairs. Market-appropriate pricing.</p>
              </div>
              <div className="bg-white rounded-lg p-3 border-2 border-orange-500">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-5 h-5 text-orange-600" />
                  <span className="font-bold text-orange-700">Grade 4: Poor</span>
                </div>
                <p className="text-xs text-slate-600">Significant wear or damage. Needs repairs before resale. Below market pricing.</p>
              </div>
              <div className="bg-white rounded-lg p-3 border-2 border-red-500">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-red-700">Grade 5: Very Poor</span>
                </div>
                <p className="text-xs text-slate-600">Major defects or damage. Extensive repairs needed. Wholesale/salvage pricing.</p>
              </div>
              <div className="bg-white rounded-lg p-3 border-2 border-slate-500">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-slate-600" />
                  <span className="font-bold text-slate-700">Grade 6: Inoperative</span>
                </div>
                <p className="text-xs text-slate-600">Non-functional vehicle. Parts value only. Salvage or scrap assessment.</p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">Appraisal Features:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                <span>• Automatic VIN decoding with NHTSA database</span>
                <span>• Mileage-based depreciation analysis</span>
                <span>• Condition-based value adjustments</span>
                <span>• Market comparables integration</span>
                <span>• Printable appraisal reports</span>
                <span>• Historical value tracking</span>
              </div>
            </div>
          </section>

          {/* PAGE 3: Export Calculator & Data Upload */}
          <div className="page-break"></div>

          <section className="print-section px-8 py-8 bg-white" data-testid="section-export">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Globe className="w-6 h-6 text-blue-600" />
              Canada-to-USA Export Profit Calculator
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              AI-powered profit analysis tool for cross-border vehicle exports:
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  Cost Analysis
                </h3>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Vehicle purchase price (CAD)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Currency conversion (CAD/USD)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Import duties & tariffs</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> EPA/DOT compliance fees</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Transportation costs</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Broker & documentation fees</li>
                </ul>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-600" />
                  AI-Powered Features
                </h3>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-purple-600" /> State-by-state market comparison</li>
                  <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-purple-600" /> Optimal selling location suggestions</li>
                  <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-purple-600" /> Profit margin calculations</li>
                  <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-purple-600" /> Market demand analysis</li>
                  <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-purple-600" /> Risk assessment reports</li>
                  <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-purple-600" /> Seasonal pricing insights</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="print-section px-8 py-6 bg-slate-50" data-testid="section-upload">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Upload className="w-6 h-6 text-blue-600" />
              Data Upload Capabilities
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              Three powerful methods for importing vehicle data:
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">CSV Upload</h3>
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Bulk import thousands of vehicles</li>
                  <li>• Automatic column mapping</li>
                  <li>• Data validation & error reports</li>
                  <li>• Duplicate detection</li>
                  <li>• Preview before import</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Link className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">URL Scraping</h3>
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Import from listing URLs</li>
                  <li>• Automatic data extraction</li>
                  <li>• Image URL capture</li>
                  <li>• Specification parsing</li>
                  <li>• Real-time scraping status</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Bot className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">AI Text Parsing</h3>
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Paste unstructured text</li>
                  <li>• AI extracts vehicle data</li>
                  <li>• Natural language processing</li>
                  <li>• Smart field detection</li>
                  <li>• Powered by Claude AI</li>
                </ul>
              </div>
            </div>
          </section>

          {/* PAGE 4: Transportation System */}
          <div className="page-break"></div>

          <section className="print-section px-8 py-8 bg-white" data-testid="section-transport">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Truck className="w-6 h-6 text-blue-600" />
              Transportation Management System
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              Complete in-house vehicle transport with competitive rates and full tracking:
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  6-Tier Distance Pricing
                </h3>
                <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="text-left py-2 px-3 text-xs font-semibold">Distance</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold">Rate/km</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white"><td className="py-1.5 px-3 text-xs">0 - 100 km</td><td className="py-1.5 px-3 text-right font-semibold text-blue-600 text-xs">$0.94</td></tr>
                      <tr className="bg-slate-50"><td className="py-1.5 px-3 text-xs">101 - 300 km</td><td className="py-1.5 px-3 text-right font-semibold text-blue-600 text-xs">$0.83</td></tr>
                      <tr className="bg-white"><td className="py-1.5 px-3 text-xs">301 - 500 km</td><td className="py-1.5 px-3 text-right font-semibold text-blue-600 text-xs">$0.72</td></tr>
                      <tr className="bg-slate-50"><td className="py-1.5 px-3 text-xs">501 - 1,000 km</td><td className="py-1.5 px-3 text-right font-semibold text-blue-600 text-xs">$0.61</td></tr>
                      <tr className="bg-white"><td className="py-1.5 px-3 text-xs">1,001 - 2,000 km</td><td className="py-1.5 px-3 text-right font-semibold text-blue-600 text-xs">$0.55</td></tr>
                      <tr className="bg-slate-50"><td className="py-1.5 px-3 text-xs">2,001+ km</td><td className="py-1.5 px-3 text-right font-semibold text-blue-600 text-xs">$0.50</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-500 mt-2">Minimum charge: $105 | 8% fuel surcharge applies</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Service Levels
                </h3>
                <div className="space-y-2">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-green-800 text-sm">Standard Delivery</span>
                      <span className="text-green-600 font-bold text-sm">Base Rate</span>
                    </div>
                    <p className="text-xs text-green-700">3-5 Business Days</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-800 text-sm">2-Day Expedited</span>
                      <span className="text-blue-600 font-bold text-sm">+30%</span>
                    </div>
                    <p className="text-xs text-blue-700">2 Business Days (min $75 premium)</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-purple-800 text-sm">1-Day Rush</span>
                      <span className="text-purple-600 font-bold text-sm">+50%</span>
                    </div>
                    <p className="text-xs text-purple-700">Next Business Day (min $150 premium)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-900 text-sm mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Included Services (No Extra Charge)
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-green-800">
                  <span>• All vehicle types</span>
                  <span>• Non-running vehicles</span>
                  <span>• Enclosed transport</span>
                  <span>• Lift gate service</span>
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <h4 className="font-semibold text-amber-900 text-sm mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  Multi-Vehicle Discounts
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-amber-800">
                  <span>• 2 vehicles: 10% off</span>
                  <span>• 3 vehicles: 15% off</span>
                  <span>• 4-5 vehicles: 20% off</span>
                  <span>• 6-10 vehicles: 25% off</span>
                </div>
              </div>
            </div>
          </section>

          <section className="print-section px-8 py-6 bg-slate-50" data-testid="section-coverage">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              Coverage Area: 21 Canadian Cities
            </h2>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <h4 className="font-semibold text-slate-900 text-xs mb-2">Ontario</h4>
                <p className="text-xs text-slate-600">Toronto, Ottawa, Hamilton, London, Windsor, Kingston, Sudbury, Thunder Bay</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <h4 className="font-semibold text-slate-900 text-xs mb-2">Quebec</h4>
                <p className="text-xs text-slate-600">Montreal, Quebec City, Gatineau, Sherbrooke, Trois-Rivières</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <h4 className="font-semibold text-slate-900 text-xs mb-2">Western Canada</h4>
                <p className="text-xs text-slate-600">Vancouver, Calgary, Edmonton, Winnipeg, Regina, Saskatoon</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <h4 className="font-semibold text-slate-900 text-xs mb-2">Atlantic</h4>
                <p className="text-xs text-slate-600">Halifax, Saint John</p>
              </div>
            </div>
            <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
              <h4 className="font-semibold text-blue-900 text-xs mb-2">Popular Routes (Sample Pricing)</h4>
              <div className="grid grid-cols-4 gap-2 text-xs text-blue-800">
                <span>Montreal → Toronto: $426</span>
                <span>Montreal → Ottawa: $176</span>
                <span>Ottawa → Toronto: $369</span>
                <span>Toronto → Calgary: $1,947</span>
              </div>
            </div>
          </section>

          {/* PAGE 5: Technical & Contact */}
          <div className="page-break"></div>

          <section className="print-section px-8 py-8 bg-white" data-testid="section-operations">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Route className="w-6 h-6 text-blue-600" />
              Transport Operations Dashboard
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              Complete fleet management and order tracking capabilities:
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <MapPinned className="w-6 h-6 text-blue-600 mb-2" />
                <h3 className="font-semibold text-slate-900 text-sm mb-1">Fleet Tracking</h3>
                <p className="text-xs text-slate-600">Real-time truck locations, driver assignments, and capacity monitoring</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                <h3 className="font-semibold text-slate-900 text-sm mb-1">Order Management</h3>
                <p className="text-xs text-slate-600">Quote-to-order conversion, scheduling, and delivery coordination</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <BarChart3 className="w-6 h-6 text-blue-600 mb-2" />
                <h3 className="font-semibold text-slate-900 text-sm mb-1">Analytics</h3>
                <p className="text-xs text-slate-600">Performance metrics, revenue tracking, and operational insights</p>
              </div>
            </div>
          </section>

          <section className="print-section px-8 py-6 bg-slate-50" data-testid="section-security">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-blue-600" />
              Security & Compliance
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 text-sm mb-3">Authentication</h3>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> OAuth 2.0 / OpenID Connect</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Multi-provider support (Google, GitHub, Apple)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Secure password hashing (bcrypt)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Session-based authentication</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> HTTP-only secure cookies</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 text-sm mb-3">Data Protection</h3>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Encrypted database connections (SSL/TLS)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Role-based access control (RBAC)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> API rate limiting</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Audit logging for sensitive operations</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Automatic session expiration (7 days)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="print-section px-8 py-6 bg-white" data-testid="section-tech-stack">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-600" />
              Technical Architecture
            </h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                <p className="font-bold text-blue-600 text-lg">React 18</p>
                <p className="text-slate-600 text-xs">Modern UI Framework</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                <p className="font-bold text-blue-600 text-lg">TypeScript</p>
                <p className="text-slate-600 text-xs">Type-Safe Development</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                <p className="font-bold text-blue-600 text-lg">PostgreSQL</p>
                <p className="text-slate-600 text-xs">Enterprise Database</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                <p className="font-bold text-blue-600 text-lg">Express.js</p>
                <p className="text-slate-600 text-xs">Fast API Server</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                <p className="font-bold text-purple-600 text-lg">Drizzle ORM</p>
                <p className="text-slate-600 text-xs">Type-Safe Queries</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                <p className="font-bold text-purple-600 text-lg">TanStack Query</p>
                <p className="text-slate-600 text-xs">Server State Management</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                <p className="font-bold text-purple-600 text-lg">Tailwind CSS</p>
                <p className="text-slate-600 text-xs">Utility-First Styling</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                <p className="font-bold text-purple-600 text-lg">Claude AI</p>
                <p className="text-slate-600 text-xs">Intelligent Analysis</p>
              </div>
            </div>
          </section>

          <footer className="print-section px-8 py-8 bg-slate-900 text-white" data-testid="section-footer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-xl">
                  <Car className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Carsellia</h2>
                  <p className="text-blue-400 text-sm">Vehicle Trading & Dealership Management</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>Ontario, Canada</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Mail className="w-4 h-4" />
                  <span>info@carsellia.com</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>1-800-CARSELLIA</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700 text-center">
              <p className="text-slate-400 text-xs">
                © {new Date().getFullYear()} Carsellia. Enterprise-grade vehicle trading platform for Canadian dealerships.
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Document generated on {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
