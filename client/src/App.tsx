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
import ScrapingDogTest from "@/pages/scrapingdog-test";
import BulkScraper from "@/pages/bulk-scraper";
import ScrapingDogDebug from "@/pages/scrapingdog-debug";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Inventory} />
        <Route path="/upload" component={UploadPage} />
        <Route path="/appraisal" component={AppraisalPage} />
        <Route path="/test-api" component={BrowserActTest} />
        <Route path="/test-scrapingdog" component={ScrapingDogTest} />
        <Route path="/bulk-scraper" component={BulkScraper} />
        <Route path="/debug-scrapingdog" component={ScrapingDogDebug} />
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
