import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useChildren } from "@/hooks/useChildren";
import { useGetMyProfile, queryOpts } from "@workspace/api-client-react";
import {
  LayoutDashboard, Smartphone, Globe, MapPin, Bell, Settings, LogOut,
  Moon, Sun, Menu, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChildSwitcher } from "@/components/dashboard/ChildSwitcher";
import { useTheme } from "@/contexts/ThemeContext";

const nav = [
  { to: "/app", icon: LayoutDashboard, label: "Overview", exact: true },
  { to: "/app/apps", icon: Smartphone, label: "App Limits" },
  { to: "/app/web", icon: Globe, label: "Web Filter" },
  { to: "/app/location", icon: MapPin, label: "Location" },
  { to: "/app/devices", icon: Shield, label: "Devices" },
  { to: "/app/alerts", icon: Bell, label: "Alerts" },
  { to: "/app/settings", icon: Settings, label: "Settings" },
];

const DashboardLayout = ({ children: pageContent }: { children?: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const { children, refresh } = useChildren();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: profile } = useGetMyProfile({ query: queryOpts({ enabled: !!user }) });
  const profileName = profile?.display_name ?? user?.name ?? user?.email?.split("@")[0] ?? "";

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location === to;
    return location.startsWith(to);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6"><Logo /></div>

      <div className="px-3">
        <ChildSwitcher children={children} onChildrenChange={refresh} />
      </div>

      <nav className="px-3 mt-6 space-y-1 flex-1">
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive(item.to, item.exact)
                ? "bg-gradient-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border/60">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-9 w-9 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-semibold text-sm">
            {profileName.slice(0, 1).toUpperCase() || "P"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{profileName}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start mt-1 text-muted-foreground">
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex w-72 border-r border-border/60 bg-card/30 backdrop-blur flex-col">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-background/80 backdrop-blur" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-card border-r border-border h-full animate-fade-in"><SidebarContent /></aside>
        </div>
      )}

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border/60 bg-card/40 backdrop-blur sticky top-0 z-30">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Logo withText />
          <Button variant="ghost" size="icon" onClick={toggle}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </header>

        <div className="flex-1 overflow-auto">
          {pageContent}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
