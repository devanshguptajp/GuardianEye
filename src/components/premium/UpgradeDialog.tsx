import { Crown, Check, Sparkles, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePremium } from "@/contexts/PremiumContext";

const perks = [
  "Live location & full history",
  "AI-powered unsafe content alerts",
  "Category-based web filtering",
  "Unlimited children & devices",
  "Priority notifications & support",
];

export const UpgradeDialog = () => {
  const { upgradeOpen, closeUpgrade, feature, setTier } = usePremium();

  return (
    <Dialog open={upgradeOpen} onOpenChange={(o) => !o && closeUpgrade()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-primary/30">
        <div className="relative ge-aurora p-6">
          <div className="absolute inset-0 bg-background/40" />
          <div className="relative flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
              <Crown className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <DialogHeader className="space-y-0">
                <DialogTitle className="font-display text-xl">GuardianEye Premium</DialogTitle>
                <DialogDescription className="text-xs">
                  {feature ? `Unlock ${feature}` : "Unlock the full safety suite"}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <ul className="space-y-2.5">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <div className="ge-card p-4 text-center">
            <div className="text-3xl font-display font-bold ge-gradient-text">$9.99<span className="text-base text-muted-foreground font-normal">/mo</span></div>
            <div className="text-xs text-muted-foreground mt-1">Cancel anytime · 7-day free trial</div>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
              onClick={() => {
                // TODO: hook up real checkout (Stripe/Paddle) here
                window.open("https://guardianeye.app/upgrade", "_blank", "noopener,noreferrer");
              }}
            >
              <Sparkles className="h-4 w-4 mr-2" /> Upgrade now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => { setTier("premium"); closeUpgrade(); }}
            >
              Try Premium (demo)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
