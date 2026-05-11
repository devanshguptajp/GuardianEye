import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const todayKey = () => `ge_a2hs_${new Date().toISOString().slice(0, 10)}`;

export const AddToHomeScreen = () => {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(todayKey())) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    const timer = setTimeout(() => setVisible(true), 3000);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(todayKey(), "1");
    setVisible(false);
  };

  const installNow = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    }
    dismiss();
  };

  if (!visible || installed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto animate-slide-up">
      <div className="ge-card p-4 border-primary/40 shadow-glow bg-card">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shrink-0 shadow-glow">
            <Smartphone className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-semibold text-sm">Add to your home screen</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Get instant access to GuardianEye from your home screen — works like a native app.
            </div>
          </div>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground shrink-0 -mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          {deferred ? (
            <Button
              size="sm"
              className="flex-1 bg-gradient-primary text-primary-foreground text-xs h-8"
              onClick={installNow}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Install app
            </Button>
          ) : (
            <Link to="/install" className="flex-1" onClick={dismiss}>
              <Button size="sm" className="w-full bg-gradient-primary text-primary-foreground text-xs h-8">
                <Download className="h-3.5 w-3.5 mr-1.5" /> How to add
              </Button>
            </Link>
          )}
          <Button size="sm" variant="outline" className="text-xs h-8 px-3" onClick={dismiss}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
};
