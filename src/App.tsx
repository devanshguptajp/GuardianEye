import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SelectedChildProvider } from "@/contexts/SelectedChildContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { UpgradeDialog } from "@/components/premium/UpgradeDialog";
import { RequireAuth, RedirectIfAuthed } from "@/components/auth/RequireAuth";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Install from "./pages/Install";
import ChildView from "./pages/ChildView";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Apps from "./pages/dashboard/Apps";
import Web from "./pages/dashboard/Web";
import Devices from "./pages/dashboard/Devices";
import Location from "./pages/dashboard/Location";
import Alerts from "./pages/dashboard/Alerts";
import Settings from "./pages/dashboard/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SelectedChildProvider>
              <PremiumProvider>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/install" element={<Install />} />
                  <Route path="/auth" element={<RedirectIfAuthed><Auth /></RedirectIfAuthed>} />
                  <Route path="/app" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
                    <Route index element={<Overview />} />
                    <Route path="apps" element={<Apps />} />
                    <Route path="web" element={<Web />} />
                    <Route path="devices" element={<Devices />} />
                    <Route path="location" element={<Location />} />
                    <Route path="alerts" element={<Alerts />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <UpgradeDialog />
              </PremiumProvider>
            </SelectedChildProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
