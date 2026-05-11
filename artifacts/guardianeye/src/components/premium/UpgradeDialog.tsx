import { Crown, Check, Sparkles, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePremium } from "@/contexts/PremiumContext";

const perks = [
  "Live location & full history",
  "AI-powered unsafe content alerts",
  "Automatic app blocking when limit is hit",
  "Up to 5 children & 5 devices",
  "Priority notifications & support",
];

const pricingOptions = [
  { label: "3 months", price: "₹499", per: "≈ ₹166/mo", badge: "" },
  { label: "1 year", price: "₹1,299", per: "≈ ₹108/mo", badge: "Best value — save 56%" },
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
                <DialogTitle className="font-display text-xl">GuardianEye Pro</DialogTitle>
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

          <div className="space-y-2">
            {pricingOptions.map((opt) => (
              <div key={opt.label} className="ge-card p-4 flex items-center justify-between relative">
                {opt.badge && (
                  <div className="absolute -top-2.5 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                    {opt.badge}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{opt.label}</span>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold">{opt.price}</div>
                  <div className="text-xs text-muted-foreground">{opt.per}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Button
              className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
              onClick={() => {
                window.open("https://guardianeye.app/upgrade", "_blank", "noopener,noreferrer");
              }}
            >
              <Sparkles className="h-4 w-4 mr-2" /> Upgrade now
            </Button>
            <p className="text-center text-[10px] text-muted-foreground">
              Secure payment · Cancel anytime · 14-day free trial included
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => { setTier("premium"); closeUpgrade(); }}
            >
              Continue with trial (demo)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
