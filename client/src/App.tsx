import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Inventory from "@/pages/inventory";
import DealerInventoryPage from "@/pages/dealer-inventory";
import UploadPage from "@/pages/upload";
import AppraisalPage from "@/pages/appraisal";
import LandingPage from "@/pages/landing";
import AdminDashboard from "@/pages/admin-dashboard";
import DataAnalystDashboard from "@/pages/data-analyst-dashboard";
import DashboardPage from "@/pages/dashboard";
import CanadianRetailPage from "@/pages/canadian-retail";
import ExportPage from "@/pages/export";
import ReferencePage from "@/pages/reference";
import SettingsPage from "@/pages/settings";
import UserManagementPage from "@/pages/user-management";
import TransportPage from "@/pages/transport";
import TransportDashboard from "@/pages/transport-dashboard";
import TransportOrdersPage from "@/pages/transport-orders";
import BrochurePage from "@/pages/brochure";
import { Loader2 } from "lucide-react";

// Admin-only route guard
function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <Redirect to="/" />;
  }
  return <Component />;
}

// Admin or Data Analyst route guard (for inventory access)
function AdminOrAnalystRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAdmin, isDataAnalyst } = useAuth();
  if (!isAdmin && !isDataAnalyst) {
    return <Redirect to="/" />;
  }
  return <Component />;
}

// Admin or Data Analyst route guard (for upload/delete access)
function UploadRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAdmin, isDataAnalyst } = useAuth();
  // Only Admin and Data Analyst can upload vehicles
  if (!isAdmin && !isDataAnalyst) {
    return <Redirect to="/" />;
  }
  return <Component />;
}

// Admin or Dealer route guard (for appraisal access)
function AppraisalRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAdmin, isDealer } = useAuth();
  // Only Admin and Dealer can access appraisal tools
  if (!isAdmin && !isDealer) {
    return <Redirect to="/" />;
  }
  return <Component />;
}

// Admin or Dealer route guard (for export access)
function ExportRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAdmin, isDealer } = useAuth();
  // Only Admin and Dealer can access export calculator
  if (!isAdmin && !isDealer) {
    return <Redirect to="/" />;
  }
  return <Component />;
}

// Transportation team route guard (for fleet/order management)
function TransportationRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAdmin, isTransportation } = useAuth();
  // Only Admin and Transportation team can access transport dashboard/orders
  if (!isAdmin && !isTransportation) {
    return <Redirect to="/" />;
  }
  return <Component />;
}

// Transport quote calculator - Admin, Dealer, and Transportation can access
function TransportQuoteRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAdmin, isDealer, isTransportation } = useAuth();
  if (!isAdmin && !isDealer && !isTransportation) {
    return <Redirect to="/" />;
  }
  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading, isAdmin, isDataAnalyst, isTransportation } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route component={LandingPage} />
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        {/* Role-based dashboard routing */}
        <Route path="/" component={isAdmin ? AdminDashboard : isDataAnalyst ? DataAnalystDashboard : isTransportation ? TransportDashboard : DashboardPage} />
        
        {/* Admin-only routes */}
        <Route path="/admin">{() => <AdminRoute component={AdminDashboard} />}</Route>
        <Route path="/user-management">{() => <AdminRoute component={UserManagementPage} />}</Route>
        
        {/* Data Analyst routes - only Admin and Data Analyst can access */}
        <Route path="/data-analyst">{() => <AdminOrAnalystRoute component={DataAnalystDashboard} />}</Route>
        
        {/* Inventory - Admin and Data Analyst can see all, Dealers see their own */}
        <Route path="/inventory">{() => <AdminOrAnalystRoute component={Inventory} />}</Route>
        <Route path="/dealer-inventory" component={DealerInventoryPage} />
        
        {/* Upload - Admin and Data Analyst only */}
        <Route path="/upload">{() => <UploadRoute component={UploadPage} />}</Route>
        
        {/* Appraisal - Admin and Dealer only (Data Analyst cannot access) */}
        <Route path="/appraisal">{() => <AppraisalRoute component={AppraisalPage} />}</Route>
        
        {/* Export Calculator - Admin and Dealer only */}
        <Route path="/export">{() => <ExportRoute component={ExportPage} />}</Route>
        
        {/* Transport - Admin, Dealer, Transportation can get quotes; Dashboard/Orders for Admin/Transport only */}
        <Route path="/transport">{() => <TransportQuoteRoute component={TransportPage} />}</Route>
        <Route path="/transport-dashboard">{() => <TransportationRoute component={TransportDashboard} />}</Route>
        <Route path="/transport-orders">{() => <TransportationRoute component={TransportOrdersPage} />}</Route>
        
        {/* Shared routes - all roles can access */}
        <Route path="/canadian-retail" component={CanadianRetailPage} />
        <Route path="/reference" component={ReferencePage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/brochure" component={BrochurePage} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
