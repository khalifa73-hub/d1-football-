import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { SidebarLayout } from "@/components/layout/sidebar-layout";

import Dashboard from "@/pages/dashboard";
import Workouts from "@/pages/workouts";
import Nutrition from "@/pages/nutrition";
import Progress from "@/pages/progress";
import Coach from "@/pages/coach";
import Recruiting from "@/pages/recruiting";
import Recovery from "@/pages/recovery";
import Film from "@/pages/film";
import More from "@/pages/more";

const queryClient = new QueryClient();

document.documentElement.classList.add("dark");

function Router() {
  return (
    <SidebarLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/workouts" component={Workouts} />
        <Route path="/nutrition" component={Nutrition} />
        <Route path="/progress" component={Progress} />
        <Route path="/coach" component={Coach} />
        <Route path="/recruiting" component={Recruiting} />
        <Route path="/recovery" component={Recovery} />
        <Route path="/film" component={Film} />
        <Route path="/more" component={More} />
        <Route component={NotFound} />
      </Switch>
    </SidebarLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
