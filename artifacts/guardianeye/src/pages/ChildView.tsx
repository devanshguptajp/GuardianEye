import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { Logo } from "@/components/Logo";
import { ArrowLeft, Lock, Clock, ShieldCheck, Smartphone, Globe, Eye } from "lucide-react";
import { usePremium } from "@/contexts/PremiumContext";
import { useGetChild, useListAppLimits, useListWebBlocklist, queryOpts } from "@workspace/api-client-react";

const ChildView = () => {
  const params = useParams<{ childId: string }>();
  const childId = params.childId;
  const { isPremium } = usePremium();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const { data: child } = useGetChild(childId!, { query: queryOpts({ enabled: !!childId }) });
  const { data: apps = [] } = useListAppLimits(childId!, { query: queryOpts({ enabled: !!childId }) });
  const { data: blocks = [] } = useListWebBlocklist(childId!, { query: queryOpts({ enabled: !!childId }) });

  const usedFor = (a: typeof apps[0]) => {
    const seed = a.id.charCodeAt(0) + a.id.charCodeAt(1);
    return Math.min(a.daily_minutes, Math.round((seed % 100) / 100 * a.daily_minutes));
  };

  const initial = child?.name?.[0]?.toUpperCase() ?? "•";

  return (
    <div className="min-h-screen ge-aurora">
      <div className="bg-card/70 backdrop-blur border-b border-border/60">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between text-xs">
          <Link to="/app/apps" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Parent view
          </Link>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Eye className="h-3.5 w-3.5" /> Child preview
          </span>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="rounded-[2.5rem] border-8 border-foreground/10 bg-background shadow-2xl overflow-hidden">
          <div className="px-6 pt-3 pb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-accent" /> Protected</span>
          </div>

          <div className="px-6 pt-2 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground font-bold text-lg shadow-glow">
                {initial}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Hi {child?.name ?? ""},</div>
                <div className="font-display font-semibold">Your day at a glance</div>
              </div>
            </div>

            <div className={`mt-4 rounded-xl px-3 py-2 text-xs flex items-center gap-2 ${
              isPremium ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"
            }`}>
              {isPremium ? <Lock className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              {isPremium ? "Auto-lock is on. Apps will pause when time is up." : "Time-up reminders only. Apps stay open."}
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="px-2 pb-2 text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Smartphone className="h-3 w-3" /> My apps
            </div>
            {apps.length === 0 ? (
              <div className="ge-card p-6 text-center text-sm text-muted-foreground">
                Nothing set up yet. Ask your parent to add some apps.
              </div>
            ) : (
              <ul className="space-y-2">
                {apps.map((a) => {
                  const used = usedFor(a);
                  const pct = a.blocked ? 100 : Math.min(100, (used / Math.max(a.daily_minutes, 1)) * 100);
                  const reached = !a.blocked && used >= a.daily_minutes;
                  const locked = a.blocked || (reached && isPremium);
                  return (
                    <li key={a.id} className="ge-card p-3 flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl grid place-items-center text-sm font-bold ${
                        locked ? "bg-destructive/15 text-destructive" : "bg-gradient-primary/15 text-primary"
                      }`}>
                        {locked ? <Lock className="h-4 w-4" /> : a.app_name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">{a.app_name}</span>
                          <span className={`text-xs shrink-0 ${locked ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                            {a.blocked ? "Blocked" : reached ? (isPremium ? "Locked" : "Time's up") : `${used}/${a.daily_minutes} min`}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className={`h-full ${locked ? "bg-destructive" : "bg-gradient-primary"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {blocks.length > 0 && (
            <div className="px-4 pb-6">
              <div className="px-2 pb-2 text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Globe className="h-3 w-3" /> Sites I can't visit
              </div>
              <div className="ge-card p-3 flex flex-wrap gap-1.5">
                {blocks.slice(0, 8).map((b) => (
                  <span key={b.id} className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground">{b.domain}</span>
                ))}
                {blocks.length > 8 && <span className="text-xs px-2 py-1 text-muted-foreground">+{blocks.length - 8} more</span>}
              </div>
            </div>
          )}

          <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between">
            <Logo />
            <span className="text-[10px] text-muted-foreground">Watched with love 💜</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          This is what {child?.name ?? "your child"} sees on their device.
        </p>
      </div>
    </div>
  );
};

export default ChildView;
