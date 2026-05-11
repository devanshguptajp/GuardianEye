import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Apple, Smartphone, Share, Plus, Download, ArrowLeft } from "lucide-react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const Install = () => {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setDeferred(e as BIPEvent); };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  return (
    <div className="min-h-screen ge-aurora">
      <div className="max-w-xl mx-auto px-6 py-10">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Link>

        <div className="flex flex-col items-center text-center">
          <Logo />
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-6">Install GuardianEye</h1>
          <p className="text-muted-foreground mt-2">Get the full app experience on your phone — works on iPhone & Android.</p>
        </div>

        {installed && (
          <div className="ge-card p-5 mt-8 text-center">
            <p className="font-medium">✓ Installed! Open GuardianEye from your home screen.</p>
          </div>
        )}

        {deferred && !installed && (
          <div className="ge-card p-6 mt-8 text-center">
            <Button onClick={install} size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow">
              <Download className="h-5 w-5 mr-2" /> Install app
            </Button>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <div className={`ge-card p-6 ${isIOS ? "ring-2 ring-primary" : ""}`}>
            <div className="flex items-center gap-2 mb-3"><Apple className="h-5 w-5" /><h2 className="font-display font-semibold">iPhone & iPad</h2></div>
            <ol className="text-sm space-y-2 text-muted-foreground">
              <li>1. Open this page in <strong className="text-foreground">Safari</strong></li>
              <li>2. Tap <Share className="inline h-4 w-4 mx-1" /> <strong className="text-foreground">Share</strong></li>
              <li>3. Choose <Plus className="inline h-4 w-4 mx-1" /> <strong className="text-foreground">Add to Home Screen</strong></li>
              <li>4. Tap <strong className="text-foreground">Add</strong></li>
            </ol>
          </div>

          <div className={`ge-card p-6 ${isAndroid ? "ring-2 ring-primary" : ""}`}>
            <div className="flex items-center gap-2 mb-3"><Smartphone className="h-5 w-5" /><h2 className="font-display font-semibold">Android</h2></div>
            <ol className="text-sm space-y-2 text-muted-foreground">
              <li>1. Open in <strong className="text-foreground">Chrome</strong></li>
              <li>2. Tap the <strong className="text-foreground">⋮ menu</strong></li>
              <li>3. Choose <strong className="text-foreground">Install app</strong> or <strong className="text-foreground">Add to Home screen</strong></li>
              <li>4. Confirm <strong className="text-foreground">Install</strong></li>
            </ol>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          GuardianEye launches full-screen like a native app, with its own icon on your home screen.
        </p>
      </div>
    </div>
  );
};

export default Install;
