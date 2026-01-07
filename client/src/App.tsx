import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Simulation from "@/pages/simulation";
import Analytics from "@/pages/analytics";
import EcoActions from "@/pages/eco-actions";
import HealthGuard from "@/pages/health-guard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/simulation" component={Simulation} />
      <Route path="/eco-actions" component={EcoActions} />
      <Route path="/health-guard" component={HealthGuard} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

import { LocationProvider } from "./hooks/use-location-context";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LocationProvider>
    </QueryClientProvider>
  );
}

export default App;
