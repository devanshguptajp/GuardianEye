import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Logo } from "@/components/Logo";
import { ShieldCheck, Smartphone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type State = "loading" | "confirm" | "pairing" | "success" | "error";

const PairDevice = () => {
  const params = useParams<{ code: string }>();
  const code = params.code?.toUpperCase() ?? "";
  const [, setLocation] = useLocation();
  const [state, setState] = useState<State>("loading");
  const [childName, setChildName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const apiBase = "/api";

  useEffect(() => {
    if (!code) { setState("error"); setErrorMsg("No pairing code found in this link."); return; }
    fetch(`${apiBase}/devices/pair/${code}`)
      .then(async (r) => {
        if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error ?? "Invalid code"); }
        return r.json();
      })
      .then((data) => {
        setChildName(data.childName ?? "your child");
        if (data.status === "active") {
          setState("success");
        } else {
          setState("confirm");
        }
      })
      .catch((e: Error) => { setState("error"); setErrorMsg(e.message); });
  }, [code]);

  const activate = () => {
    setState("pairing");
    const ua = navigator.userAgent;
    const platform = /iPad|iPhone|iPod/.test(ua) ? "ios" : /Android/.test(ua) ? "android" : "web";
    fetch(`${apiBase}/devices/pair/${code}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform }),
    })
      .then(async (r) => {
        if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error ?? "Failed"); }
        return r.json();
      })
      .then(() => setState("success"))
      .catch((e: Error) => { setState("error"); setErrorMsg(e.message); });
  };

  return (
    <div className="min-h-screen ge-aurora flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-[2.5rem] border-8 border-foreground/10 bg-background shadow-2xl overflow-hidden p-8 space-y-6 text-center">

          {state === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <div className="font-display font-semibold">Checking pairing code…</div>
            </>
          )}

          {state === "confirm" && (
            <>
              <div className="h-16 w-16 rounded-2xl bg-gradient-primary grid place-items-center mx-auto shadow-glow">
                <Smartphone className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <div className="font-display font-bold text-xl">Pair this device</div>
                <div className="text-sm text-muted-foreground mt-1">
                  This will connect your device to <strong>{childName}</strong>'s GuardianEye profile.
                </div>
              </div>
              <div className="ge-card p-4 text-left space-y-2 text-sm text-muted-foreground">
                <div className="flex gap-2"><ShieldCheck className="h-4 w-4 text-accent mt-0.5 shrink-0" /> Your parent will be able to see app usage and set time limits</div>
                <div className="flex gap-2"><ShieldCheck className="h-4 w-4 text-accent mt-0.5 shrink-0" /> Location tracking only when enabled by parent</div>
                <div className="flex gap-2"><ShieldCheck className="h-4 w-4 text-accent mt-0.5 shrink-0" /> All data is private to your family</div>
              </div>
              <div className="font-mono text-xs bg-secondary rounded-lg px-3 py-2 text-muted-foreground">
                Code: <strong>{code}</strong>
              </div>
              <Button className="w-full bg-gradient-primary text-primary-foreground shadow-glow" onClick={activate}>
                <ShieldCheck className="h-4 w-4 mr-2" /> Connect this device
              </Button>
            </>
          )}

          {state === "pairing" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <div className="font-display font-semibold">Connecting…</div>
              <div className="text-sm text-muted-foreground">Linking this device to {childName}'s profile.</div>
            </>
          )}

          {state === "success" && (
            <>
              <div className="h-16 w-16 rounded-2xl bg-accent/15 grid place-items-center mx-auto">
                <CheckCircle2 className="h-9 w-9 text-accent" />
              </div>
              <div>
                <div className="font-display font-bold text-xl text-accent">Device connected!</div>
                <div className="text-sm text-muted-foreground mt-1">
                  This device is now linked to <strong>{childName}</strong>'s profile. Your parent's GuardianEye dashboard will start monitoring.
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLocation("/")}
              >
                Go to homepage
              </Button>
            </>
          )}

          {state === "error" && (
            <>
              <div className="h-16 w-16 rounded-2xl bg-destructive/15 grid place-items-center mx-auto">
                <AlertCircle className="h-9 w-9 text-destructive" />
              </div>
              <div>
                <div className="font-display font-bold text-xl">Pairing failed</div>
                <div className="text-sm text-muted-foreground mt-1">{errorMsg || "This link may be expired or already used."}</div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/")}>
                Back to home
              </Button>
            </>
          )}

          <div className="pt-2 border-t border-border/60">
            <Logo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PairDevice;
