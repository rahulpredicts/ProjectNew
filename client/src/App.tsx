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
import { Loader2 } from "lucide-react";

function AdminOrAnalystRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAdmin, isDataAnalyst } = useAuth();
  if (!isAdmin && !isDataAnalyst) {
    return <Redirect to="/" />;
  }
  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading, isAdmin, isDataAnalyst } = useAuth();

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
        <Route path="/" component={isAdmin ? AdminDashboard : isDataAnalyst ? DataAnalystDashboard : DashboardPage} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/data-analyst" component={DataAnalystDashboard} />
        <Route path="/inventory">{() => <AdminOrAnalystRoute component={Inventory} />}</Route>
        <Route path="/dealer-inventory" component={DealerInventoryPage} />
        <Route path="/upload" component={UploadPage} />
        <Route path="/appraisal">{() => <AdminOrAnalystRoute component={AppraisalPage} />}</Route>
        <Route path="/export">{() => <AdminOrAnalystRoute component={ExportPage} />}</Route>
        <Route path="/canadian-retail" component={CanadianRetailPage} />
        <Route path="/reference" component={ReferencePage} />
        <Route path="/settings" component={SettingsPage} />
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
