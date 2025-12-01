import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Car, 
  Calculator, 
  LogOut, 
  Users, 
  Shield, 
  Database,
  Package,
  MapPin,
  FileDown,
  BookOpen,
  Settings,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isAdmin, isDataAnalyst } = useAuth();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  // Admin navigation - Full access to all features including Appraise and Export
  const adminNavItems = [
    { href: "/admin", label: "Admin Dashboard", icon: Shield },
    { href: "/inventory", label: "All Inventory", icon: Package },
    { href: "/appraisal", label: "Appraise", icon: Calculator },
    { href: "/export", label: "Export Calculator", icon: FileDown },
    { href: "/upload", label: "Add Vehicles", icon: PlusCircle },
    { href: "/canadian-retail", label: "Canadian Retail", icon: MapPin },
    { href: "/reference", label: "Reference", icon: BookOpen },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  // Data Analyst navigation - Access to inventory, appraise, export, and data tools
  const dataAnalystNavItems = [
    { href: "/data-analyst", label: "Data Analyst Hub", icon: Database },
    { href: "/inventory", label: "All Inventory", icon: Package },
    { href: "/appraisal", label: "Appraise", icon: Calculator },
    { href: "/export", label: "Export Calculator", icon: FileDown },
    { href: "/upload", label: "Add Vehicles", icon: PlusCircle },
    { href: "/canadian-retail", label: "Canadian Retail", icon: MapPin },
    { href: "/reference", label: "Reference", icon: BookOpen },
  ];

  // Dealer navigation - Inventory for buying/selling + Vehicle Appraisal tool (NO valuations, NO Export)
  const dealerNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dealer-inventory", label: "Your Inventory", icon: Package },
    { href: "/appraisal", label: "Vehicle Appraisal", icon: Calculator },
    { href: "/upload", label: "Add Vehicles", icon: PlusCircle },
    { href: "/canadian-retail", label: "Canadian Retail", icon: MapPin },
    { href: "/reference", label: "Reference", icon: BookOpen },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : isDataAnalyst ? dataAnalystNavItems : dealerNavItems;

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 md:min-h-screen flex-shrink-0 flex flex-col">
        {/* Header with Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-none text-white">Carsellia</h2>
              <p className="text-xs text-slate-400 mt-1">
                {isAdmin ? 'Admin Panel' : isDataAnalyst ? 'Data Analyst' : 'Dealer Portal'}
              </p>
            </div>
          </div>
          
          {/* Profile Dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10 border-2 border-slate-700 hover:border-blue-500 transition-colors">
                    <AvatarImage src={user.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end">
                <DropdownMenuLabel className="text-white">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.firstName || 'User'}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-white">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-white">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem 
                  className="text-red-400 focus:bg-red-900/50 focus:text-red-300"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* User Role Badge */}
        {user && (
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg">
              {isAdmin ? (
                <Shield className="w-4 h-4 text-yellow-400" />
              ) : isDataAnalyst ? (
                <Database className="w-4 h-4 text-purple-400" />
              ) : (
                <Users className="w-4 h-4 text-blue-400" />
              )}
              <span className="text-sm text-slate-300 capitalize">{user.role?.replace('_', ' ')}</span>
            </div>
          </div>
        )}
        
        {/* Navigation Links */}
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
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
