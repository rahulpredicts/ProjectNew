import { Link, useLocation } from "wouter";
import { LayoutDashboard, PlusCircle, Car, Calculator, LogOut, Users, Shield, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isAdmin, isDataAnalyst } = useAuth();
  const currentIsDataAnalyst = isDataAnalyst;

  const navItems = [
    ...(isAdmin 
      ? [{ href: "/admin", label: "Admin Dashboard", icon: Shield, adminOnly: true }]
      : isDataAnalyst
      ? [{ href: "/data-analyst", label: "Data Analyst Hub", icon: PlusCircle, adminOnly: false }]
      : [{ href: "/", label: "Inventory", icon: LayoutDashboard, adminOnly: false }]
    ),
    { href: "/inventory", label: "Inventory", icon: LayoutDashboard, adminOnly: false, hidden: isAdmin || isDataAnalyst },
    { href: "/upload", label: "Add Vehicles", icon: PlusCircle, adminOnly: false, hidden: isAdmin },
    { href: "/appraisal", label: "Appraisal Tool", icon: Calculator, adminOnly: false, hidden: isAdmin || isDataAnalyst },
  ];

  const filteredNavItems = navItems.filter(item => !item.hidden);

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 md:min-h-screen flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-none text-white">Carsellia</h2>
            <p className="text-xs text-slate-400 mt-1">
              {isAdmin ? 'Admin Panel' : currentIsDataAnalyst ? 'Data Analyst Hub' : 'Dealer Portal'}
            </p>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.firstName || user.email?.split('@')[0] || 'User'}
                </p>
                <div className="flex items-center gap-1">
                  {isAdmin ? (
                    <Shield className="w-3 h-3 text-yellow-400" />
                  ) : currentIsDataAnalyst ? (
                    <Database className="w-3 h-3 text-purple-400" />
                  ) : (
                    <Users className="w-3 h-3 text-blue-400" />
                  )}
                  <span className="text-xs text-slate-400 capitalize">{user.role?.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <nav className="p-4 space-y-2 flex-1">
          {filteredNavItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-slate-800">
          <Button
            variant="destructive"
            className="w-full justify-center bg-red-600 hover:bg-red-700 text-white font-medium"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
