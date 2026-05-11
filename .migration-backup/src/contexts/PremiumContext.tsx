import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Tier = "basic" | "premium";

type Ctx = {
  tier: Tier;
  isPremium: boolean;
  /**
   * Demo-only: flips the local UI state so reviewers can preview premium UX.
   * Real entitlement is enforced server-side via `profiles.subscription_tier`,
   * which can only be changed by the billing system (service role).
   */
  setTier: (t: Tier) => void;
  upgradeOpen: boolean;
  openUpgrade: (feature?: string) => void;
  closeUpgrade: () => void;
  feature: string | null;
};

const PremiumCtx = createContext<Ctx>({
  tier: "basic",
  isPremium: false,
  setTier: () => {},
  upgradeOpen: false,
  openUpgrade: () => {},
  closeUpgrade: () => {},
  feature: null,
});

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [serverTier, setServerTier] = useState<Tier>("basic");
  const [demoTier, setDemoTier] = useState<Tier | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [feature, setFeature] = useState<string | null>(null);

  // Load tier from server profile (single source of truth for entitlement).
  useEffect(() => {
    if (!user) {
      setServerTier("basic");
      setDemoTier(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const t = (data?.subscription_tier === "premium" ? "premium" : "basic") as Tier;
      setServerTier(t);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const tier: Tier = demoTier ?? serverTier;

  return (
    <PremiumCtx.Provider
      value={{
        tier,
        isPremium: tier === "premium",
        setTier: setDemoTier,
        upgradeOpen,
        openUpgrade: (f) => {
          setFeature(f ?? null);
          setUpgradeOpen(true);
        },
        closeUpgrade: () => setUpgradeOpen(false),
        feature,
      }}
    >
      {children}
    </PremiumCtx.Provider>
  );
};

export const usePremium = () => useContext(PremiumCtx);
