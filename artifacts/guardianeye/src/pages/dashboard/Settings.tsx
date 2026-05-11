import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { usePremium } from "@/contexts/PremiumContext";
import { Crown, ShieldCheck, LogOut, Lock, Sun, Moon, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { DeleteChildSection } from "@/components/settings/DeleteChildSection";
import {
  useGetMyProfile, useUpdateMyProfile, useSetPin, useVerifyPin,
  queryOpts, type UpdateMyProfileMutationError,
} from "@workspace/api-client-react";
import { PinInput } from "@/components/PinInput";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: profile } = useGetMyProfile({ query: queryOpts({ enabled: !!user }) });
  const updateProfile = useUpdateMyProfile();

  useEffect(() => {
    if (profile?.display_name) setName(profile.display_name);
  }, [profile]);

  const save = () => {
    setBusy(true);
    updateProfile.mutate({ data: { display_name: name } }, {
      onSuccess: () => { setBusy(false); toast({ title: "Saved" }); },
      onError: (err: UpdateMyProfileMutationError) => { setBusy(false); toast({ title: "Failed", description: err.message, variant: "destructive" }); },
    });
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-2xl animate-fade-in">
      <h1 className="font-display text-3xl font-bold">Settings</h1>

      <section className="ge-card p-6 space-y-4">
        <h2 className="font-display font-semibold">Profile</h2>
        <div>
          <Label htmlFor="dn">Display name</Label>
          <Input id="dn" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
          <p className="text-xs text-muted-foreground mt-1">Shown in your dashboard. You can update this any time.</p>
        </div>
        <div>
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled className="mt-1.5" />
        </div>
        <Button onClick={save} disabled={busy} className="bg-gradient-primary text-primary-foreground">
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </section>

      <section className="ge-card p-6 space-y-4">
        <h2 className="font-display font-semibold flex items-center gap-2">
          {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          Appearance
        </h2>
        <Button variant="outline" onClick={toggle}>
          Switch to {theme === "dark" ? "light" : "dark"} mode
        </Button>
      </section>

      <ParentPinSection hasPin={!!profile?.pin_hash} />

      <PremiumSection />

      <DeleteChildSection />

      <section className="ge-card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-accent" />
          <h2 className="font-display font-semibold">Security</h2>
        </div>
        <Button variant="outline" onClick={async () => { await signOut(); setLocation("/"); }}>
          <LogOut className="h-4 w-4 mr-2" /> Sign out everywhere
        </Button>
      </section>
    </div>
  );
};

const ParentPinSection = ({ hasPin }: { hasPin: boolean }) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<"idle" | "set" | "change_verify" | "change_set">("idle");
  const [pinLen, setPinLen] = useState<4 | 6>(4);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [busy, setBusy] = useState(false);
  const setPin_ = useSetPin();
  const verifyPin = useVerifyPin();

  const reset = () => { setMode("idle"); setPin(""); setConfirmPin(""); setStep("enter"); };

  const handleSet = () => {
    if (step === "enter") {
      if (pin.length !== pinLen) return;
      setStep("confirm");
      setConfirmPin("");
      return;
    }
    if (confirmPin !== pin) {
      toast({ title: "PINs don't match", description: "Please try again.", variant: "destructive" });
      setConfirmPin("");
      return;
    }
    setBusy(true);
    setPin_.mutate({ data: { pin_hash: btoa(pin) } }, {
      onSuccess: () => { toast({ title: "Parent PIN saved" }); reset(); setBusy(false); },
      onError: () => { toast({ title: "Failed to save PIN", variant: "destructive" }); setBusy(false); },
    });
  };

  const handleChangeVerify = () => {
    if (pin.length < 4) return;
    setBusy(true);
    verifyPin.mutate({ data: { pin_hash: btoa(pin) } }, {
      onSuccess: (r) => {
        setBusy(false);
        if (r.valid) { setMode("change_set"); setPin(""); setStep("enter"); }
        else toast({ title: "Incorrect PIN", variant: "destructive" });
      },
      onError: () => { setBusy(false); toast({ title: "Verification failed", variant: "destructive" }); },
    });
  };

  return (
    <section className="ge-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="h-5 w-5 text-primary" />
        <h2 className="font-display font-semibold">Parent PIN</h2>
        {hasPin && <span className="ml-auto text-xs text-accent font-medium">Active</span>}
        {!hasPin && <span className="ml-auto text-xs text-warning font-medium">Not set</span>}
      </div>
      <p className="text-sm text-muted-foreground">
        A 4 or 6-digit numeric PIN to access parent controls on a shared device. Different from your account password.
      </p>

      {mode === "idle" && (
        <div className="flex gap-2">
          {!hasPin ? (
            <Button className="bg-gradient-primary text-primary-foreground" onClick={() => setMode("set")}>
              <Lock className="h-4 w-4 mr-2" /> Set a PIN now
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setMode("change_verify")}>Change PIN</Button>
          )}
        </div>
      )}

      {(mode === "set" || mode === "change_set") && (
        <div className="space-y-4 pt-2">
          {step === "enter" && (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">PIN length:</span>
                <div className="flex gap-2">
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
              </div>
              <div>
                <p className="text-sm text-center text-muted-foreground mb-3">Enter your new PIN</p>
                <PinInput length={pinLen} value={pin} onChange={setPin} autoFocus />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={reset} className="flex-1">Cancel</Button>
                <Button
                  className="flex-1 bg-gradient-primary text-primary-foreground"
                  disabled={pin.length !== pinLen}
                  onClick={handleSet}
                >
                  Next
                </Button>
              </div>
            </>
          )}
          {step === "confirm" && (
            <>
              <div>
                <p className="text-sm text-center text-muted-foreground mb-3">Confirm your PIN</p>
                <PinInput length={pinLen} value={confirmPin} onChange={setConfirmPin} autoFocus />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setStep("enter"); setPin(""); setConfirmPin(""); }} className="flex-1">Back</Button>
                <Button
                  className="flex-1 bg-gradient-primary text-primary-foreground"
                  disabled={confirmPin.length !== pinLen || busy}
                  onClick={handleSet}
                >
                  {busy ? "Saving…" : "Save PIN"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {mode === "change_verify" && (
        <div className="space-y-4 pt-2">
          <div>
            <p className="text-sm text-center text-muted-foreground mb-3">Enter your current PIN to verify</p>
            <PinInput length={pinLen} value={pin} onChange={setPin} autoFocus />
            <div className="flex justify-center mt-2 gap-2">
              {([4, 6] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => { setPinLen(n); setPin(""); }}
                  className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${pinLen === n ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
                >
                  {n}-digit
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset} className="flex-1">Cancel</Button>
            <Button
              className="flex-1 bg-gradient-primary text-primary-foreground"
              disabled={pin.length < 4 || busy}
              onClick={handleChangeVerify}
            >
              {busy ? "Verifying…" : "Verify"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

const PremiumSection = () => {
  const { isPremium, isOnTrial, trialDaysLeft, trialEndsAt, openUpgrade } = usePremium();
  return (
    <section className="ge-card p-6 space-y-4 relative overflow-hidden">
      <div className="absolute inset-0 ge-aurora opacity-30 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 flex-wrap">
          <Crown className="h-5 w-5 text-primary" />
          <h2 className="font-display font-semibold">Subscription</h2>
          <span className={`ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isPremium ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            {isOnTrial ? "Pro Trial" : isPremium ? "Pro" : "Free"}
          </span>
        </div>

        {isOnTrial && (
          <div className="mt-3 flex items-center gap-2 text-sm text-accent bg-accent/10 rounded-lg px-3 py-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              Free trial active — <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left</strong>
              {trialEndsAt && ` (expires ${trialEndsAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })})`}
            </span>
          </div>
        )}

        {!isOnTrial && !isPremium && (
          <div className="mt-3 flex items-center gap-2 text-sm text-warning bg-warning/10 rounded-lg px-3 py-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>Your trial has ended. Upgrade to keep Pro features.</span>
          </div>
        )}

        <p className="text-sm text-muted-foreground mt-2">
          {isPremium && !isOnTrial
            ? "All Pro features are unlocked. Thank you for supporting GuardianEye!"
            : isOnTrial
            ? "You have full Pro access during your trial. Upgrade to keep your features after it ends."
            : "Upgrade to Pro for AI moderation, live location, auto-locking, up to 5 children & devices."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="ge-card p-3 text-center">
            <div className="font-bold text-lg">₹499</div>
            <div className="text-xs text-muted-foreground">for 3 months</div>
          </div>
          <div className="ge-card p-3 text-center border-accent/40">
            <div className="font-bold text-lg">₹1,299</div>
            <div className="text-xs text-muted-foreground">per year · best value</div>
          </div>
        </div>

        {(!isPremium || isOnTrial) && (
          <Button className="mt-4 w-full bg-gradient-primary text-primary-foreground shadow-glow" onClick={() => openUpgrade()}>
            <Crown className="h-4 w-4 mr-2" />
            {isOnTrial ? "Upgrade to keep Pro" : "Upgrade to Pro"}
          </Button>
        )}
      </div>
    </section>
  );
};

export default Settings;
