import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAds } from "@/hooks/use-public";

// Pages
import NotFound from "@/pages/not-found";
import Step1Landing from "@/pages/public/Step1Landing";
import Step2Scroll from "@/pages/public/Step2Scroll";
import Step3Verify from "@/pages/public/Step3Verify";
import Step4Download from "@/pages/public/Step4Download";
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";

function PublicRouteHandler({ params }: { params: { id: string } }) {
  const [location] = useLocation();
  const { data: ads = [] } = useAds();

  // Basic client-side routing logic for steps based on URL pattern
  if (location.endsWith("/verify")) {
    return <Step2Scroll linkId={params.id} ads={ads} />;
  }
  if (location.endsWith("/security")) {
    return <Step3Verify linkId={params.id} ads={ads} />;
  }
  if (location.endsWith("/download")) {
    return <Step4Download linkId={params.id} ads={ads} />;
  }

  // Default to step 1
  return <Step1Landing linkId={params.id} ads={ads} />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/link/:id" component={PublicRouteHandler} />
      <Route path="/link/:id/verify" component={PublicRouteHandler} />
      <Route path="/link/:id/security" component={PublicRouteHandler} />
      <Route path="/link/:id/download" component={PublicRouteHandler} />

      {/* Admin Routes */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
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
