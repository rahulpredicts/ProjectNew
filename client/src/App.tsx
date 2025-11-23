import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Inventory from "@/pages/inventory";
import UploadPage from "@/pages/upload";
import AppraisalPage from "@/pages/appraisal";
import BrowserActTest from "@/pages/browseract-test";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Inventory} />
        <Route path="/upload" component={UploadPage} />
        <Route path="/appraisal" component={AppraisalPage} />
        <Route path="/test-api" component={BrowserActTest} />
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
