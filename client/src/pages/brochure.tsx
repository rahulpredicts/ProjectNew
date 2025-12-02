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
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Shield,
    title: "Role-Based Access Control",
    description: "Admin, Dealer, Data Analyst, and Transportation roles with specific permissions and secure access levels."
  },
  {
    icon: Package,
    title: "Vehicle Inventory Management",
    description: "34,000+ vehicles with advanced filtering, multi-criteria search, and real-time availability tracking."
  },
  {
    icon: ClipboardCheck,
    title: "Carsellia Grade Appraisal",
    description: "Professional vehicle condition grading: Excellent, Good, Fair, Poor, Very Poor, and Inoperative classifications."
  },
  {
    icon: Globe,
    title: "Canada-to-USA Export Calculator",
    description: "AI-powered profit analysis with state-by-state comparison, duty calculations, and market insights."
  },
  {
    icon: Truck,
    title: "Transportation Management",
    description: "Own fleet with 6-tier distance pricing covering 21 Canadian cities with competitive rates."
  },
  {
    icon: MapPin,
    title: "Real-Time Tracking",
    description: "Fleet monitoring, order management, driver assignment, and live delivery status updates."
  }
];

const pricingTiers = [
  { range: "0 - 100 km", rate: "$3.50/km" },
  { range: "101 - 300 km", rate: "$2.75/km" },
  { range: "301 - 500 km", rate: "$2.25/km" },
  { range: "501 - 1,000 km", rate: "$1.85/km" },
  { range: "1,001 - 2,000 km", rate: "$1.65/km" },
  { range: "2,001+ km", rate: "$1.45/km" }
];

const serviceLevels = [
  { name: "Standard", time: "3-5 Business Days", modifier: "Base Rate" },
  { name: "2-Day Expedited", time: "2 Business Days", modifier: "+30%" },
  { name: "1-Day Rush", time: "Next Business Day", modifier: "+50%" }
];

const techStack = [
  { name: "React", description: "Modern UI Framework" },
  { name: "TypeScript", description: "Type-Safe Development" },
  { name: "PostgreSQL", description: "Reliable Database" },
  { name: "Express", description: "Fast API Server" }
];

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
            margin: 15mm 12mm;
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
          <header className="print-header bg-gradient-to-br from-slate-900 to-slate-800 text-white px-8 py-10 print:py-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Car className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight" data-testid="text-brand-name">Carsellia</h1>
                <p className="text-blue-400 text-lg font-medium mt-1" data-testid="text-tagline">
                  Vehicle Trading & Dealership Management Platform
                </p>
              </div>
            </div>
          </header>

          <section className="print-section px-8 py-8 bg-white" data-testid="section-overview">
            <div className="flex items-start gap-4 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Platform Overview</h2>
                <p className="text-slate-600 text-base leading-relaxed" data-testid="text-platform-description">
                  Carsellia is a comprehensive, production-ready vehicle trading and dealership management platform 
                  designed to support <span className="font-semibold text-blue-600">100,000+ concurrent users</span>. 
                  Built with enterprise-grade security, the platform provides secure authentication with role-based 
                  access control, comprehensive vehicle inventory management, and advanced AI-powered appraisal tools 
                  for the Canadian automotive industry.
                </p>
              </div>
            </div>
          </section>

          <section className="print-section px-8 py-6 bg-slate-50" data-testid="section-features">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Zap className="w-6 h-6 text-blue-600" />
              Key Features
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="feature-card bg-white rounded-lg p-4 border border-slate-200 shadow-sm"
                  data-testid={`card-feature-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg shrink-0">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm mb-1">{feature.title}</h3>
                      <p className="text-slate-600 text-xs leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="print-section px-8 py-6 bg-white" data-testid="section-pricing">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-blue-600" />
              Transportation Pricing
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              Competitive 6-tier distance-based pricing with our own dedicated fleet
            </p>
            <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left py-2 px-4 text-sm font-semibold">Distance Range</th>
                    <th className="text-right py-2 px-4 text-sm font-semibold">Rate per Kilometer</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingTiers.map((tier, index) => (
                    <tr 
                      key={index} 
                      className={`pricing-row ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                      data-testid={`row-pricing-${index}`}
                    >
                      <td className="py-2 px-4 text-slate-700 text-sm">{tier.range}</td>
                      <td className="py-2 px-4 text-right font-semibold text-blue-600 text-sm">{tier.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="print-section px-8 py-6 bg-slate-50" data-testid="section-service-levels">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              Service Levels
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {serviceLevels.map((level, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-lg p-4 border border-slate-200 text-center shadow-sm"
                  data-testid={`card-service-${index}`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <h3 className="font-semibold text-slate-900 text-sm">{level.name}</h3>
                  </div>
                  <p className="text-slate-600 text-xs mb-1">{level.time}</p>
                  <p className="text-blue-600 font-bold text-sm">{level.modifier}</p>
                </div>
              ))}
            </div>
          </section>

          <footer className="print-section px-8 py-6 bg-slate-900 text-white" data-testid="section-tech-stack">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-3">
              <Database className="w-5 h-5 text-blue-400" />
              Technical Stack
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {techStack.map((tech, index) => (
                <div 
                  key={index} 
                  className="text-center"
                  data-testid={`tech-stack-${index}`}
                >
                  <p className="font-bold text-blue-400 text-lg">{tech.name}</p>
                  <p className="text-slate-400 text-xs">{tech.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700 text-center">
              <p className="text-slate-400 text-xs">
                © {new Date().getFullYear()} Carsellia. Enterprise-grade vehicle trading platform for Canadian dealerships.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
