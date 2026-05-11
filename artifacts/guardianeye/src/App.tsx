import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SelectedChildProvider } from "@/contexts/SelectedChildContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { UpgradeDialog } from "@/components/premium/UpgradeDialog";

import Landing from "./pages/Landing";
import Install from "./pages/Install";
import ChildView from "./pages/ChildView";
import NotFound from "./pages/not-found";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Apps from "./pages/dashboard/Apps";
import Web from "./pages/dashboard/Web";
import Devices from "./pages/dashboard/Devices";
import Location from "./pages/dashboard/Location";
import Alerts from "./pages/dashboard/Alerts";
import Settings from "./pages/dashboard/Settings";
import { useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function SignInPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:flex items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 ge-aurora opacity-90" />
        <div className="relative z-10 max-w-md text-foreground">
          <div className="flex items-center gap-2 mb-10">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center">
              <svg className="h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span className="font-display font-bold text-xl">GuardianEye</span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight">
            Family safety,<br /><span className="ge-gradient-text">re-imagined.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Real-time monitoring, AI moderation, and a dashboard you'll actually want to open.</p>
          <div className="mt-10 ge-glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Live alert</div>
            <div className="mt-2 font-medium">⚠️ New install detected on Mia's iPhone</div>
            <div className="text-xs text-muted-foreground mt-1">TikTok · 2 minutes ago</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:flex items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 ge-aurora opacity-90" />
        <div className="relative z-10 max-w-md text-foreground">
          <div className="flex items-center gap-2 mb-10">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center">
              <svg className="h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span className="font-display font-bold text-xl">GuardianEye</span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight">
            Family safety,<br /><span className="ge-gradient-text">re-imagined.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Start protecting your family in 2 minutes. Real-time monitoring, AI alerts and smart controls.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (!loading && !user) setLocation("/sign-in");
  }, [user, loading, setLocation]);
  if (loading) return <div className="min-h-screen grid place-items-center bg-background"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;
  return <>{children}</>;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsub = addListener(({ user }) => {
      const uid = user?.id ?? null;
      if (prevRef.current !== undefined && prevRef.current !== uid) qc.clear();
      prevRef.current = uid;
    });
    return unsub;
  }, [addListener, qc]);
  return null;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  return (
    <Switch>
      <Route path="/">
        {loading ? null : user ? <Redirect to="/app" /> : <Landing />}
      </Route>
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/install" component={Install} />
      <Route path="/child/:childId">
        {(params) => <RequireAuth><ChildView /></RequireAuth>}
      </Route>
      <Route path="/app">
        <RequireAuth>
          <DashboardLayout><Overview /></DashboardLayout>
        </RequireAuth>
      </Route>
      <Route path="/app/:rest+">
        <RequireAuth>
          <DashboardLayout>
            <Switch>
              <Route path="/app/apps" component={Apps} />
              <Route path="/app/web" component={Web} />
              <Route path="/app/devices" component={Devices} />
              <Route path="/app/location" component={Location} />
              <Route path="/app/alerts" component={Alerts} />
              <Route path="/app/settings" component={Settings} />
            </Switch>
          </DashboardLayout>
        </RequireAuth>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      proxyUrl={clerkProxyUrl}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
              <SelectedChildProvider>
                <PremiumProvider>
                  <AppRoutes />
                  <UpgradeDialog />
                </PremiumProvider>
              </SelectedChildProvider>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
