import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Smartphone, ArrowRight } from "lucide-react";
import { useListChildren, queryOpts } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "ge_welcomed";

export const OnboardingModal = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const { data: children, isSuccess } = useListChildren({ query: queryOpts({ enabled: !!user }) });

  useEffect(() => {
    if (!isSuccess) return undefined;
    const already = localStorage.getItem(STORAGE_KEY);
    if (!already && children.length === 0) {
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isSuccess, children]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const getStarted = () => {
    dismiss();
    setLocation("/app");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dismiss()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border-primary/30">
        <div className="relative ge-aurora p-7 pb-5">
          <div className="absolute inset-0 bg-background/50" />
          <div className="relative flex flex-col items-center text-center gap-3">
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-display text-xl">Welcome to GuardianEye!</DialogTitle>
              <DialogDescription>Your 14-day free Pro trial has started.</DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-muted-foreground text-center">
            You're all set — now let's protect your family. Complete these two steps to start monitoring:
          </p>

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
          </div>

          <Button className="w-full bg-gradient-primary text-primary-foreground shadow-glow" onClick={getStarted}>
            Go to dashboard <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={dismiss}>
            I'll set up later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
