import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Logo } from "@/components/Logo";
import { Lock, Clock, ShieldCheck, Smartphone, Globe, User, Shield } from "lucide-react";
import { usePremium } from "@/contexts/PremiumContext";
import { useGetChild, useListAppLimits, useListWebBlocklist, useVerifyPin, queryOpts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { PinInput } from "@/components/PinInput";

type Role = "select" | "child" | "pin_gate";

const ChildView = () => {
  const params = useParams<{ childId: string }>();
  const childId = params.childId;
  const [role, setRole] = useState<Role>("select");
  const [, setLocation] = useLocation();

  const { data: child } = useGetChild(childId!, { query: queryOpts({ enabled: !!childId }) });

  if (role === "select") {
    return <RoleSelector childName={child?.name ?? "your child"} onChild={() => setRole("child")} onParent={() => setRole("pin_gate")} />;
  }

  if (role === "pin_gate") {
    return <PinGate onSuccess={() => setLocation("/app")} onBack={() => setRole("select")} />;
  }

  return <ChildContent childId={childId!} childName={child?.name ?? ""} onSwitchRole={() => setRole("select")} />;
};

const RoleSelector = ({ childName, onChild, onParent }: { childName: string; onChild: () => void; onParent: () => void }) => (
  <div className="min-h-screen ge-aurora flex items-center justify-center p-4">
    <div className="w-full max-w-sm">
      <div className="rounded-[2.5rem] border-8 border-foreground/10 bg-background shadow-2xl overflow-hidden">
        <div className="px-6 pt-4 pb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-accent" /> GuardianEye</span>
        </div>

        <div className="px-6 pt-6 pb-8 text-center space-y-6">
          <div>
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground font-bold text-2xl shadow-glow mx-auto">
              {childName[0]?.toUpperCase() ?? "•"}
            </div>
            <div className="mt-3 font-display font-bold text-xl">Who is using this device?</div>
            <div className="text-sm text-muted-foreground mt-1">Choose how you want to continue</div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onChild}
              className="w-full ge-card p-4 flex items-center gap-3 hover:border-primary/50 transition-all active:scale-95 text-left"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-primary/15 grid place-items-center shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">I'm {childName}</div>
                <div className="text-xs text-muted-foreground">Continue to child view</div>
              </div>
            </button>

            <button
              onClick={onParent}
              className="w-full ge-card p-4 flex items-center gap-3 hover:border-accent/50 transition-all active:scale-95 text-left"
            >
              <div className="h-10 w-10 rounded-xl bg-accent/15 grid place-items-center shrink-0">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="font-semibold">I'm a Parent</div>
                <div className="text-xs text-muted-foreground">Requires parent PIN</div>
              </div>
            </button>
          </div>

          <div className="pt-2 border-t border-border/60">
            <Logo />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PinGate = ({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const verifyPin = useVerifyPin();

  const tryPin = (p: string) => {
    if (p.length < 4) return;
    setError("");
    setBusy(true);
    verifyPin.mutate({ data: { pin_hash: btoa(p) } }, {
      onSuccess: (r) => {
        setBusy(false);
        if (r.valid) {
          onSuccess();
        } else {
          setAttempts((n) => n + 1);
          setPin("");
          setError(attempts >= 2 ? "Too many attempts. Try again later." : "Incorrect PIN. Please try again.");
        }
      },
      onError: () => { setBusy(false); setError("Verification failed. Check your connection."); },
    });
  };

  useEffect(() => {
    if (pin.length === 4 || pin.length === 6) {
      tryPin(pin);
    }
  }, [pin]);

  return (
    <div className="min-h-screen ge-aurora flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-[2.5rem] border-8 border-foreground/10 bg-background shadow-2xl overflow-hidden p-8 space-y-6 text-center">
          <div>
            <div className="h-14 w-14 rounded-2xl bg-accent/15 grid place-items-center mx-auto">
              <Shield className="h-7 w-7 text-accent" />
            </div>
            <div className="mt-3 font-display font-bold text-lg">Parent access</div>
            <div className="text-sm text-muted-foreground mt-1">Enter your parent PIN to continue</div>
          </div>

          <PinInput length={4} value={pin} onChange={setPin} autoFocus disabled={busy} />
          {pin.length === 6 && <PinInput length={6} value={pin} onChange={setPin} autoFocus disabled={busy} />}

          {error && <p className="text-destructive text-sm">{error}</p>}
          {busy && <p className="text-muted-foreground text-sm">Verifying…</p>}

          <div className="text-xs text-muted-foreground">Try 4 digits or 6 digits depending on your PIN length</div>

          <Button variant="ghost" size="sm" onClick={onBack} className="w-full text-muted-foreground">
            ← Back
          </Button>
        </div>
      </div>
    </div>
  );
};

const ChildContent = ({ childId, childName, onSwitchRole }: { childId: string; childName: string; onSwitchRole: () => void }) => {
  const { isPremium } = usePremium();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const { data: apps = [] } = useListAppLimits(childId, { query: queryOpts({ enabled: !!childId }) });
  const { data: blocks = [] } = useListWebBlocklist(childId, { query: queryOpts({ enabled: !!childId }) });

  const usedFor = (a: (typeof apps)[0]) => {
    const seed = a.id.charCodeAt(0) + a.id.charCodeAt(1);
    return Math.min(a.daily_minutes, Math.round(((seed % 100) / 100) * a.daily_minutes));
  };

  const initial = childName[0]?.toUpperCase() ?? "•";

  return (
    <div className="min-h-screen ge-aurora">
      <div className="bg-card/70 backdrop-blur border-b border-border/60">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between text-xs">
          <button onClick={onSwitchRole} className="inline-flex items-center text-muted-foreground hover:text-foreground">
            ← Switch role
          </button>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Protected
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
                <div className="text-xs text-muted-foreground">Hi {childName},</div>
                <div className="font-display font-semibold">Your day at a glance</div>
              </div>
            </div>

            <div className={`mt-4 rounded-xl px-3 py-2 text-xs flex items-center gap-2 ${
              isPremium ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"
            }`}>
              {isPremium ? <Lock className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              {isPremium
                ? "Auto-lock is on. Apps will pause when your daily time is up."
                : "Time-up reminders only. Your parent hasn't enabled auto-lock."}
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
                    <li key={a.id} className={`ge-card p-3 flex items-center gap-3 ${locked ? "opacity-80" : ""}`}>
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
                          <div className={`h-full transition-all ${locked ? "bg-destructive" : "bg-gradient-primary"}`} style={{ width: `${pct}%` }} />
                        </div>
                        {locked && isPremium && (
                          <div className="mt-1 text-[10px] text-destructive">Daily limit reached — app is blocked until tomorrow</div>
                        )}
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
          This is what {childName} sees on their device.
        </p>
      </div>
    </div>
  );
};

export default ChildView;
