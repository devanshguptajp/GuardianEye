import { useState } from "react";
import { Sparkles, Smartphone, Globe, Bell, Clock, AlertTriangle, MapPin, WifiOff, BookOpen, Focus, Loader2 } from "lucide-react";
import { useChildren } from "@/hooks/useChildren";
import { useSelectedChild } from "@/contexts/SelectedChildContext";
import { Link } from "wouter";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";
import { useListAlerts, useSetFocusMode, useGetChild, queryOpts } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { usePremium } from "@/contexts/PremiumContext";

const sampleHourly = Array.from({ length: 12 }, (_, i) => ({
  hour: `${(i * 2).toString().padStart(2, "0")}:00`,
  minutes: Math.round(20 + Math.sin(i / 1.5) * 18 + Math.random() * 14),
}));

type FocusModeType = "internet_blocked" | "homework" | "focus";

const FOCUS_MODES: { mode: FocusModeType; label: string; activeLabel: string; icon: typeof WifiOff; color: string; activeColor: string; desc: string; duration?: number }[] = [
  {
    mode: "internet_blocked",
    label: "Instant Internet Block",
    activeLabel: "Internet Blocked",
    icon: WifiOff,
    color: "bg-destructive/10 text-destructive border-destructive/30",
    activeColor: "bg-destructive text-destructive-foreground border-destructive shadow-glow",
    desc: "Blocks all internet access immediately.",
  },
  {
    mode: "homework",
    label: "Homework Time",
    activeLabel: "Homework Time On",
    icon: BookOpen,
    color: "bg-warning/10 text-warning border-warning/30",
    activeColor: "bg-warning text-warning-foreground border-warning shadow-glow",
    desc: "Blocks social & gaming apps for 60 min.",
    duration: 60,
  },
  {
    mode: "focus",
    label: "Focus Time",
    activeLabel: "Focus Mode On",
    icon: Focus,
    color: "bg-accent/10 text-accent border-accent/30",
    activeColor: "bg-accent text-accent-foreground border-accent shadow-glow",
    desc: "Blocks all non-educational apps for 30 min.",
    duration: 30,
  },
];

const Overview = () => {
  const { children, refresh } = useChildren();
  const { selectedId, setSelectedId } = useSelectedChild();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isPremium, openUpgrade } = usePremium();

  const selected = children.find((c) => c.id === selectedId) ?? children[0];

  useEffect(() => {
    if (children.length && !selectedId) setSelectedId(children[0].id);
  }, [children, selectedId, setSelectedId]);

  const { data: alerts = [] } = useListAlerts(selected?.id ?? "", { query: queryOpts({ enabled: !!selected?.id }) });
  const { data: childDetail } = useGetChild(selected?.id ?? "", { query: queryOpts({ enabled: !!selected?.id }) });
  const setFocusMode = useSetFocusMode();
  const [togglingMode, setTogglingMode] = useState<FocusModeType | null>(null);

  if (children.length === 0) return <EmptyState onAdded={refresh} />;
  if (!selected) return null;

  const recentAlerts = alerts.slice(0, 5);
  const currentMode = childDetail?.focus_mode as FocusModeType | null | undefined;

  const stats = [
    { icon: Clock, label: "Today's screen time", value: "3h 24m", change: "−18%", positive: true },
    { icon: Smartphone, label: "Apps used", value: "12", change: "+2" },
    { icon: Globe, label: "Sites visited", value: "47", change: "−8" },
    { icon: AlertTriangle, label: "AI alerts", value: alerts.filter(a => a.severity !== "info").length.toString(), change: "live" },
  ];

  const handleFocusToggle = (modeInfo: typeof FOCUS_MODES[0]) => {
    if (!isPremium) { openUpgrade("quick actions"); return; }
    const isActive = currentMode === modeInfo.mode;
    const newMode = isActive ? null : modeInfo.mode;
    setTogglingMode(modeInfo.mode);
    setFocusMode.mutate(
      { childId: selected.id, data: { mode: newMode, duration_minutes: newMode ? modeInfo.duration : undefined } },
      {
        onSuccess: () => {
          setTogglingMode(null);
          queryClient.invalidateQueries();
          toast({
            title: isActive ? `${modeInfo.label} turned off` : `${modeInfo.activeLabel} activated`,
            description: isActive ? `${selected.name}'s device is back to normal.` : modeInfo.desc,
          });
        },
        onError: () => {
          setTogglingMode(null);
          toast({ title: "Failed", description: "Could not update focus mode.", variant: "destructive" });
        },
      },
    );
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-fade-in">
      <header>
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="font-display text-3xl lg:text-4xl font-bold mt-1">
          Here's how <span className="ge-gradient-text">{selected.name}</span> is doing today.
        </h1>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="ge-card p-5">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary/10 grid place-items-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <span className={`text-xs font-medium ${s.positive ? "text-success" : "text-muted-foreground"}`}>{s.change}</span>
            </div>
            <div className="mt-4 font-display text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Quick Actions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold">Quick actions</h2>
          <span className="text-xs text-muted-foreground">Tap to toggle for {selected.name}</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {FOCUS_MODES.map((m) => {
            const isActive = currentMode === m.mode;
            const isLoading = togglingMode === m.mode;
            return (
              <button
                key={m.mode}
                onClick={() => handleFocusToggle(m)}
                disabled={isLoading}
                className={`ge-card p-4 flex items-start gap-3 text-left border transition-all hover:-translate-y-0.5 active:scale-95 ${isActive ? m.activeColor : m.color} ${isLoading ? "opacity-70 cursor-wait" : "cursor-pointer"}`}
              >
                <div className={`h-9 w-9 rounded-xl grid place-items-center shrink-0 ${isActive ? "bg-white/20" : "bg-current/10"}`}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <m.icon className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{isActive ? m.activeLabel : m.label}</div>
                  <div className={`text-xs mt-0.5 ${isActive ? "opacity-80" : "opacity-70"}`}>{m.desc}</div>
                  {isActive && <div className="text-[10px] mt-1 font-medium uppercase tracking-wide opacity-80">Active — tap to turn off</div>}
                </div>
              </button>
            );
          })}
        </div>
        {!isPremium && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Quick actions require Pro.{" "}
            <button className="text-primary underline" onClick={() => openUpgrade("quick actions")}>Upgrade now</button>
          </p>
        )}
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="ge-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">Screen time today</h3>
              <p className="text-xs text-muted-foreground">Minutes per 2-hour block</p>
            </div>
            <div className="text-xs text-muted-foreground">Sample data</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampleHourly}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Area type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ge-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Recent alerts</h3>
            <Link to="/app/alerts" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {recentAlerts.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No alerts. All good.
            </div>
          ) : (
            <ul className="space-y-3">
              {recentAlerts.map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <div className={`h-8 w-8 rounded-lg shrink-0 grid place-items-center ${
                    a.severity === "high" ? "bg-destructive/15 text-destructive" :
                    a.severity === "warning" ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary"
                  }`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: "/app/apps", icon: Smartphone, label: "Set app limits" },
          { to: "/app/web", icon: Globe, label: "Block websites" },
          { to: "/app/location", icon: MapPin, label: "View location" },
          { to: "/app/devices", icon: Sparkles, label: "Pair new device" },
        ].map((a) => (
          <Link key={a.to} to={a.to} className="ge-card p-5 hover:border-primary/50 transition-all hover:-translate-y-0.5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-glow">
              <a.icon className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm">{a.label}</span>
          </Link>
        ))}
      </section>
    </div>
  );
};

const EmptyState = ({ onAdded }: { onAdded: () => void }) => (
  <div className="min-h-[80vh] grid place-items-center p-6">
    <div className="text-center max-w-md animate-fade-in">
      <div className="h-20 w-20 mx-auto rounded-3xl bg-gradient-primary grid place-items-center shadow-glow mb-6 animate-float">
        <Sparkles className="h-9 w-9 text-primary-foreground" />
      </div>
      <h2 className="font-display text-3xl font-bold">Let's get started</h2>
      <p className="mt-3 text-muted-foreground">Add your first child to set up monitoring, app limits and alerts.</p>
      <p className="mt-6 text-sm text-muted-foreground">Use the <strong>+ Add child</strong> option in the sidebar above.</p>
    </div>
  </div>
);

export default Overview;
