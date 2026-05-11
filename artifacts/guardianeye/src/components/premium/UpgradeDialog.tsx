import { useState } from "react";
import { Crown, Check, Sparkles, Calendar, Clock } from "lucide-react";
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
  { id: "quarterly", label: "3 months", price: "₹499", per: "≈ ₹166/mo", badge: "" },
  { id: "annual", label: "1 year", price: "₹1,299", per: "≈ ₹108/mo · save 56%", badge: "Best value" },
];

export const UpgradeDialog = () => {
  const { upgradeOpen, closeUpgrade, feature, isOnTrial, trialDaysLeft } = usePremium();
  const [selected, setSelected] = useState<"quarterly" | "annual">("annual");

  const selectedPlan = pricingOptions.find((o) => o.id === selected)!;

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
          {isOnTrial && (
            <div className="rounded-lg bg-accent/10 border border-accent/30 px-4 py-3 text-sm text-accent flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                You have <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left</strong> on your 14-day free trial. Upgrade now to keep Pro after it ends.
              </span>
            </div>
          )}

          <ul className="space-y-2.5">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Choose your plan</p>
            <div className="space-y-2">
              {pricingOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelected(opt.id as "quarterly" | "annual")}
                  className={`w-full ge-card p-4 flex items-center justify-between relative transition-all ${
                    selected === opt.id
                      ? "border-primary/70 bg-primary/5 shadow-glow"
                      : "hover:border-border/80"
                  }`}
                >
                  {opt.badge && (
                    <div className="absolute -top-2.5 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                      {opt.badge}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${selected === opt.id ? "border-primary bg-primary" : "border-border"}`}>
                      {selected === opt.id && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold">{opt.price}</div>
                    <div className="text-xs text-muted-foreground">{opt.per}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
              onClick={() => {
                closeUpgrade();
                window.open(`https://guardianeye.app/upgrade?plan=${selected}`, "_blank", "noopener,noreferrer");
              }}
            >
              <Sparkles className="h-4 w-4 mr-2" /> Upgrade — {selectedPlan.price}/{selectedPlan.label}
            </Button>
            <p className="text-center text-[10px] text-muted-foreground">
              Secure payment · Cancel anytime · 14-day free trial for new accounts
            </p>
            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={closeUpgrade}>
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
