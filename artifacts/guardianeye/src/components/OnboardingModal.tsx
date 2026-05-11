import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Smartphone, ArrowRight, Lock, CheckCircle2, User } from "lucide-react";
import { useListChildren, useGetMyProfile, useUpdateMyProfile, useSetPin, queryOpts } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { PinInput } from "@/components/PinInput";
import { Logo } from "@/components/Logo";

const storageKey = (userId: string) => `ge_welcomed_${userId}`;

type Step = "name" | "pin" | "done";

export const OnboardingModal = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("name");
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");
  const [pinLen, setPinLen] = useState<4 | 6>(4);
  const [busy, setBusy] = useState(false);

  const { data: children, isSuccess } = useListChildren({ query: queryOpts({ enabled: !!user }) });
  const { data: profile } = useGetMyProfile({ query: queryOpts({ enabled: !!user }) });
  const updateProfile = useUpdateMyProfile();
  const setPin_ = useSetPin();

  const suggested = user?.name
    ?? (user?.email
      ? user.email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()).trim()
      : "");

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    } else if (suggested) {
      setDisplayName(suggested);
    }
  }, [profile?.display_name, suggested]);

  useEffect(() => {
    if (!isSuccess || !user) return undefined;
    const already = localStorage.getItem(storageKey(user.id));
    if (!already && children.length === 0) {
      const timer = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isSuccess, children, user]);

  const finish = () => {
    if (user) localStorage.setItem(storageKey(user.id), "1");
    setOpen(false);
  };

  const handleNameNext = () => {
    if (!displayName.trim()) return;
    setBusy(true);
    updateProfile.mutate(
      { data: { display_name: displayName.trim() } },
      {
        onSuccess: () => { setBusy(false); setStep("pin"); },
        onError: () => { setBusy(false); setStep("pin"); },
      },
    );
  };

  const handlePinSave = () => {
    if (pin.length !== pinLen) return;
    setBusy(true);
    setPin_.mutate(
      { data: { pin_hash: btoa(pin) } },
      {
        onSuccess: () => { setBusy(false); setStep("done"); },
        onError: () => { setBusy(false); setStep("done"); },
      },
    );
  };

  const handleSkipPin = () => setStep("done");

  const goToDashboard = () => {
    finish();
    setLocation("/app");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) finish(); }}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border-primary/30">
        <div className="relative ge-aurora px-7 pt-7 pb-4">
          <div className="absolute inset-0 bg-background/50" />
          <div className="relative flex flex-col items-center text-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
              <Shield className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display font-bold text-xl">
                {step === "name" && "Welcome to GuardianEye!"}
                {step === "pin" && "Create a parent PIN"}
                {step === "done" && "You're all set!"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {step === "name" && "Your 7-day free Pro trial has started"}
                {step === "pin" && "Secure your dashboard with a PIN"}
                {step === "done" && "Let's start protecting your family"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-1.5 py-3">
          {(["name", "pin", "done"] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step ? "w-6 bg-primary" : i < (["name","pin","done"] as Step[]).indexOf(step) ? "w-3 bg-primary/50" : "w-3 bg-border"
              }`}
            />
          ))}
        </div>

        <div className="px-6 pb-6 space-y-4">
          {step === "name" && (
            <>
              <div className="ge-card p-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-primary/15 grid place-items-center shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">What should we call you?</div>
                  <div className="text-sm text-muted-foreground">This is your display name in the dashboard.</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="onboard-name">Your name</Label>
                <Input
                  id="onboard-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Rahul Mehta"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleNameNext()}
                />
                <p className="text-[11px] text-muted-foreground">Auto-filled from your account — you can change this any time in Settings.</p>
              </div>
              <Button
                className="w-full bg-gradient-primary text-primary-foreground"
                disabled={!displayName.trim() || busy}
                onClick={handleNameNext}
              >
                {busy ? "Saving…" : "Continue"} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}

          {step === "pin" && (
            <>
              <div className="ge-card p-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-accent/15 grid place-items-center shrink-0">
                  <Lock className="h-4 w-4 text-accent" />
                </div>
                <div className="text-sm text-muted-foreground">
                  A PIN keeps your parent dashboard private. Required to access settings on a child's device.
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <span className="text-sm text-muted-foreground">PIN length:</span>
                {([4, 6] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => { setPinLen(n); setPin(""); }}
                    className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${pinLen === n ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
                  >
                    {n} digits
                  </button>
                ))}
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-3">Enter your {pinLen}-digit PIN</p>
                <PinInput length={pinLen} value={pin} onChange={setPin} autoFocus />
              </div>

              <Button
                className="w-full bg-gradient-primary text-primary-foreground"
                disabled={pin.length !== pinLen || busy}
                onClick={handlePinSave}
              >
                {busy ? "Saving…" : "Save PIN"} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={handleSkipPin}>
                Skip for now (you can set it in Settings)
              </Button>
            </>
          )}

          {step === "done" && (
            <>
              <div className="space-y-3">
                <div className="flex items-start gap-3 ge-card p-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-primary/15 grid place-items-center shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Add a child profile</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Create a profile for each child you want to monitor.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 ge-card p-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-primary/15 grid place-items-center shrink-0">
                    <Smartphone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Link their device</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Scan the QR code on their phone to pair it instantly.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 ge-card p-3 border-accent/30 bg-accent/5">
                  <div className="h-8 w-8 rounded-lg bg-accent/15 grid place-items-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-accent">7-day free Pro trial active</div>
                    <div className="text-xs text-muted-foreground mt-0.5">All Pro features unlocked. No credit card needed.</div>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-gradient-primary text-primary-foreground shadow-glow" onClick={goToDashboard}>
                Go to dashboard <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}

          <div className="flex justify-center pt-1">
            <Logo />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
