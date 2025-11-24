import { Link, useLocation } from "wouter";
import { LayoutDashboard, PlusCircle, Car, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Inventory", icon: LayoutDashboard },
    { href: "/upload", label: "Add Vehicles", icon: PlusCircle },
    { href: "/appraisal", label: "Appraisal Tool", icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 md:min-h-screen flex-shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="bg-black text-white p-2 rounded-lg">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-none">AutoManager</h2>
            <p className="text-xs text-gray-500 mt-1">Dealer System</p>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                  isActive 
                    ? "bg-black text-white shadow-lg shadow-black/10" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
