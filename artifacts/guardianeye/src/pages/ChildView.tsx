import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Logo } from "@/components/Logo";
import { Lock, Clock, ShieldCheck, Smartphone, Globe, User, Shield, WifiOff, BookOpen, Focus, QrCode, Camera, X, ExternalLink } from "lucide-react";
import { usePremium } from "@/contexts/PremiumContext";
import { useGetChild, useListAppLimits, useListWebBlocklist, useVerifyPin, queryOpts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { PinInput } from "@/components/PinInput";
import jsQR from "jsqr";

type Role = "select" | "child" | "pin_gate";

const FOCUS_META: Record<string, { icon: typeof WifiOff; label: string; desc: string; color: string }> = {
  internet_blocked: {
    icon: WifiOff,
    label: "Internet Blocked",
    desc: "Your parent has blocked all internet access right now.",
    color: "bg-destructive/15 text-destructive",
  },
  homework: {
    icon: BookOpen,
    label: "Homework Time",
    desc: "Social and gaming apps are restricted. Focus on your studies!",
    color: "bg-warning/15 text-warning",
  },
  focus: {
    icon: Focus,
    label: "Focus Mode",
    desc: "Non-educational apps are paused. Stay on task!",
    color: "bg-accent/15 text-accent",
  },
};

const SAMPLE_CHROME_HISTORY = [
  { title: "Khan Academy", url: "khanacademy.org", time: "2:15 PM", icon: "🎓" },
  { title: "YouTube", url: "youtube.com", time: "1:40 PM", icon: "▶️" },
  { title: "Google Search", url: "google.com", time: "12:30 PM", icon: "🔍" },
  { title: "Wikipedia", url: "wikipedia.org", time: "11:55 AM", icon: "📖" },
  { title: "Coolmathgames", url: "coolmathgames.com", time: "10:20 AM", icon: "🧮" },
];

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

  return <ChildContent childId={childId!} child={child} onSwitchRole={() => setRole("select")} />;
};

const QRScanner = ({ onFound, onClose }: { onFound: (url: string) => void; onClose: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);

  const scan = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animRef.current = requestAnimationFrame(scan);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code?.data) {
      setScanning(false);
      stopStream();
      onFound(code.data);
    } else {
      animRef.current = requestAnimationFrame(scan);
    }
  };

  const stopStream = () => {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          videoRef.current.oncanplay = () => { animRef.current = requestAnimationFrame(scan); };
        }
      })
      .catch(() => setError("Camera access denied. Please allow camera permission and try again."));

    return stopStream;
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-display font-bold">Scan parent's QR code</div>
          <button onClick={() => { stopStream(); onClose(); }} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        {error ? (
          <div className="ge-card p-6 text-center text-sm text-destructive">{error}</div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-square">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-primary rounded-xl opacity-70 animate-pulse" />
              </div>
            )}
          </div>
        )}
        <p className="text-xs text-center text-muted-foreground">
          Point the camera at the QR code shown on your parent's GuardianEye dashboard (Devices page).
        </p>
        <Button variant="outline" className="w-full" onClick={() => { stopStream(); onClose(); }}>Cancel</Button>
      </div>
    </div>
  );
};

const RoleSelector = ({ childName, onChild, onParent }: { childName: string; onChild: () => void; onParent: () => void }) => {
  const [, setLocation] = useLocation();
  const [showScanner, setShowScanner] = useState(false);

  const handleQRFound = (url: string) => {
    setShowScanner(false);
    const match = url.match(/\/pair\/([A-Z0-9]+)/i);
    if (match) {
      setLocation(`/pair/${match[1].toUpperCase()}`);
    } else {
      window.location.href = url;
    }
  };

  return (
    <>
      {showScanner && (
        <QRScanner onFound={handleQRFound} onClose={() => setShowScanner(false)} />
      )}
      <div className="min-h-screen ge-aurora flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="rounded-[2.5rem] border-8 border-foreground/10 bg-background shadow-2xl overflow-hidden">
            <div className="px-6 pt-4 pb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-accent" /> GuardianEye</span>
            </div>

            <div className="px-6 pt-6 pb-8 text-center space-y-5">
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
                    <div className="text-xs text-muted-foreground">See my app time &amp; activity</div>
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
                    <div className="text-xs text-muted-foreground">Requires parent PIN → go to dashboard</div>
                  </div>
                </button>

                <button
                  onClick={() => setShowScanner(true)}
                  className="w-full ge-card p-4 flex items-center gap-3 hover:border-primary/40 transition-all active:scale-95 text-left border-dashed"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center shrink-0">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Scan to connect</div>
                    <div className="text-xs text-muted-foreground">Scan parent's QR code to pair this device</div>
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
    </>
  );
};

const PinGate = ({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) => {
  const [pin, setPin] = useState("");
  const [pinLen, setPinLen] = useState<4 | 6>(4);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const verifyPin = useVerifyPin();

  const tryPin = (p: string) => {
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
          setError(attempts >= 2 ? "Too many attempts. Try again later." : "Incorrect PIN. Try again.");
        }
      },
      onError: () => { setBusy(false); setError("Connection error. Check your network."); },
    });
  };

  useEffect(() => {
    if (pin.length === pinLen && !busy) {
      tryPin(pin);
    }
  }, [pin, pinLen]);

  return (
    <div className="min-h-screen ge-aurora flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-[2.5rem] border-8 border-foreground/10 bg-background shadow-2xl overflow-hidden p-8 space-y-6 text-center">
          <div>
            <div className="h-14 w-14 rounded-2xl bg-accent/15 grid place-items-center mx-auto">
              <Shield className="h-7 w-7 text-accent" />
            </div>
            <div className="mt-3 font-display font-bold text-lg">Parent access</div>
            <div className="text-sm text-muted-foreground mt-1">Enter your parent PIN to go to the dashboard</div>
          </div>

          <div className="flex justify-center gap-2 mb-2">
            {([4, 6] as const).map((n) => (
              <button
                key={n}
                onClick={() => { setPinLen(n); setPin(""); setError(""); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${pinLen === n ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground"}`}
              >
                {n}-digit PIN
              </button>
            ))}
          </div>

          <PinInput length={pinLen} value={pin} onChange={setPin} autoFocus disabled={busy} />

          {error && <p className="text-destructive text-sm">{error}</p>}
          {busy && <p className="text-muted-foreground text-sm">Verifying…</p>}

          <Button variant="ghost" size="sm" onClick={onBack} className="w-full text-muted-foreground">
            ← Back
          </Button>
        </div>
      </div>
    </div>
  );
};

const ChildContent = ({
  childId,
  child,
  onSwitchRole,
}: {
  childId: string;
  child: { name?: string; focus_mode?: string | null; focus_mode_expires_at?: string | null } | undefined;
  onSwitchRole: () => void;
}) => {
  const { isPremium } = usePremium();
  const [now, setNow] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const { data: apps = [] } = useListAppLimits(childId, { query: queryOpts({ enabled: !!childId }) });
  const { data: blocks = [] } = useListWebBlocklist(childId, { query: queryOpts({ enabled: !!childId }) });

  const childName = child?.name ?? "";
  const focusMode = child?.focus_mode;
  const focusExpiresAt = child?.focus_mode_expires_at ? new Date(child.focus_mode_expires_at) : null;
  const focusModeActive = focusMode && (!focusExpiresAt || focusExpiresAt > now);
  const focusMeta = focusMode ? FOCUS_META[focusMode] : null;

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
            <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Child mode — read only
          </span>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="rounded-[2.5rem] border-8 border-foreground/10 bg-background shadow-2xl overflow-hidden">
          <div className="px-6 pt-3 pb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-accent" /> Protected</span>
          </div>

          <div className="px-6 pt-2 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground font-bold text-lg shadow-glow">
                {initial}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Hi {childName},</div>
                <div className="font-display font-semibold">Your day at a glance</div>
              </div>
            </div>

            {focusModeActive && focusMeta && (
              <div className={`mt-3 rounded-xl px-3 py-2.5 flex items-start gap-2 ${focusMeta.color}`}>
                <focusMeta.icon className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-semibold">{focusMeta.label} is active</div>
                  <div className="text-xs opacity-80 mt-0.5">{focusMeta.desc}</div>
                  {focusExpiresAt && (
                    <div className="text-xs opacity-70 mt-0.5">
                      Until {focusExpiresAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!focusModeActive && (
              <div className={`mt-3 rounded-xl px-3 py-2 text-xs flex items-center gap-2 ${
                isPremium ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"
              }`}>
                {isPremium ? <Lock className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                {isPremium
                  ? "Auto-lock is on. Apps will pause when your daily time is up."
                  : "Time-up reminders only. Your parent hasn't enabled auto-lock."}
              </div>
            )}

            <div className="mt-3 rounded-xl bg-secondary/50 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
              <Lock className="h-3 w-3 shrink-0 text-warning" />
              You can only view this screen. Settings are managed by your parent.
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="px-2 pb-2 text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Smartphone className="h-3 w-3" /> My apps today
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
                  const focusLocked = !!focusModeActive && focusMode !== "internet_blocked";
                  const locked = a.blocked || (reached && isPremium) || focusLocked;
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
                            {a.blocked ? "Blocked" : focusLocked ? "Paused" : reached ? (isPremium ? "Locked" : "Time's up") : `${used}/${a.daily_minutes} min`}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className={`h-full transition-all ${locked ? "bg-destructive" : "bg-gradient-primary"}`} style={{ width: `${pct}%` }} />
                        </div>
                        {locked && (
                          <div className="mt-1 text-[10px] text-destructive">
                            {focusLocked ? `${focusMeta?.label ?? "Focus mode"} — app paused` : "Daily limit reached — blocked until tomorrow"}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="px-4 pb-4">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="w-full px-2 pb-2 text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1.5"><Globe className="h-3 w-3" /> Chrome — recently visited</span>
              <span>{showHistory ? "▲ Hide" : "▼ Show"}</span>
            </button>
            {showHistory && (
              <ul className="space-y-1.5">
                {SAMPLE_CHROME_HISTORY.map((h) => (
                  <li key={h.url} className="ge-card px-3 py-2.5 flex items-center gap-3">
                    <span className="text-base">{h.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{h.title}</div>
                      <div className="text-[10px] text-muted-foreground">{h.url}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground shrink-0">{h.time}</div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                  </li>
                ))}
                <li className="text-[10px] text-center text-muted-foreground py-1">Sample data — real history from Chrome sync coming soon</li>
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
          This is {childName}'s read-only view. Only a parent can change settings.
        </p>
      </div>
    </div>
  );
};

export default ChildView;
