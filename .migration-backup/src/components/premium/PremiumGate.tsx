import { ReactNode } from "react";
import { Crown, Lock } from "lucide-react";
import { usePremium } from "@/contexts/PremiumContext";
import { cn } from "@/lib/utils";

/**
 * Wraps premium-only UI. In basic mode the children render visibly but are
 * blurred + un-clickable, with a tappable lock overlay that opens the upgrade dialog.
 */
export const PremiumGate = ({
  children,
  feature,
  className,
  variant = "overlay",
}: {
  children: ReactNode;
  feature: string;
  className?: string;
  variant?: "overlay" | "inline";
}) => {
  const { isPremium, openUpgrade } = usePremium();

  if (isPremium) return <>{children}</>;

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={() => openUpgrade(feature)}
        className={cn(
          "relative inline-flex items-center gap-1.5 opacity-70 hover:opacity-100 transition",
          className
        )}
      >
        <Lock className="h-3 w-3" />
        {children}
      </button>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div aria-hidden className="pointer-events-none select-none blur-[2px] opacity-60">
        {children}
      </div>
      <button
        type="button"
        onClick={() => openUpgrade(feature)}
        className="absolute inset-0 grid place-items-center rounded-2xl bg-background/40 backdrop-blur-sm hover:bg-background/55 transition group"
      >
        <div className="ge-glass rounded-2xl px-5 py-4 flex items-center gap-3 shadow-card group-hover:scale-[1.02] transition-transform">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Crown className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="text-left">
            <div className="font-display font-semibold text-sm">Premium feature</div>
            <div className="text-xs text-muted-foreground">Tap to unlock {feature}</div>
          </div>
        </div>
      </button>
    </div>
  );
};

/** Small inline "PRO" pill for labelling premium menu items / categories. */
export const PremiumBadge = ({ className }: { className?: string }) => (
  <span className={cn(
    "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-primary text-primary-foreground",
    className
  )}>
    <Crown className="h-2.5 w-2.5" /> Pro
  </span>
);
