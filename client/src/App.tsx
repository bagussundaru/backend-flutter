import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Users from "@/pages/users";
import Documents from "@/pages/documents";
import Activities from "@/pages/activities";
import Notifications from "@/pages/notifications";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import Agreements from "@/pages/agreements";
import QuotaMonitoring from "@/pages/quota-monitoring";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Layout>
          <Route path="/" component={Dashboard} />
          <Route path="/users" component={Users} />
          <Route path="/documents" component={Documents} />
          <Route path="/activities" component={Activities} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/reports" component={Reports} />
          <Route path="/agreements" component={Agreements} />
          <Route path="/quota-monitoring" component={QuotaMonitoring} />
        </Layout>
      )}
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
