import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InventoryProvider } from "@/lib/inventory-context";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Inventory from "@/pages/inventory";
import UploadPage from "@/pages/upload";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Inventory} />
        <Route path="/upload" component={UploadPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <InventoryProvider>
          <Toaster />
          <Router />
        </InventoryProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
