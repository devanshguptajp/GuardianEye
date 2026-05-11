import { Sparkles, Smartphone, Globe, Bell, Clock, TrendingDown, AlertTriangle, MapPin } from "lucide-react";
import { useChildren } from "@/hooks/useChildren";
import { useSelectedChild } from "@/contexts/SelectedChildContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";
import { formatDistanceToNow } from "date-fns";

const sampleHourly = Array.from({ length: 12 }, (_, i) => ({
  hour: `${(i * 2).toString().padStart(2, "0")}:00`,
  minutes: Math.round(20 + Math.sin(i / 1.5) * 18 + Math.random() * 14),
}));

const Overview = () => {
  const { children, refresh } = useChildren();
  const { selectedId, setSelectedId } = useSelectedChild();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);

  const selected = children.find((c) => c.id === selectedId) ?? children[0];

  useEffect(() => {
    if (children.length && !selectedId) setSelectedId(children[0].id);
  }, [children, selectedId, setSelectedId]);

  useEffect(() => {
    if (!user || !selected) return;
    supabase.from("alerts").select("*").eq("child_id", selected.id).order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => setAlerts(data ?? []));
    const ch = supabase.channel(`alerts-${selected.id}`).on("postgres_changes", {
      event: "INSERT", schema: "public", table: "alerts", filter: `child_id=eq.${selected.id}`,
    }, (p) => setAlerts((a) => [p.new as any, ...a].slice(0, 5))).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, selected]);

  if (children.length === 0) return <EmptyState onAdded={refresh} />;
  if (!selected) return null;

  const stats = [
    { icon: Clock, label: "Today's screen time", value: "3h 24m", change: "−18%", positive: true },
    { icon: Smartphone, label: "Apps used", value: "12", change: "+2" },
    { icon: Globe, label: "Sites visited", value: "47", change: "−8" },
    { icon: AlertTriangle, label: "AI alerts", value: alerts.filter(a => a.severity !== "info").length.toString(), change: "live" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-fade-in">
      <header>
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="font-display text-3xl lg:text-4xl font-bold mt-1">
          Here's how <span className="ge-gradient-text">{selected.name}</span> is doing today.
        </h1>
      </header>

      {/* Stats */}
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
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

        {/* Alerts */}
        <div className="ge-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Recent alerts</h3>
            <Link to="/app/alerts" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {alerts.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No alerts. All good.
            </div>
          ) : (
            <ul className="space-y-3">
              {alerts.map((a) => (
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

      {/* Quick actions */}
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
      <p className="mt-3 text-muted-foreground">
        Add your first child to set up monitoring, app limits and alerts.
      </p>
      <p className="mt-6 text-sm text-muted-foreground">
        Use the <strong>+ Add child</strong> option in the sidebar above.
      </p>
    </div>
  </div>
);

export default Overview;
