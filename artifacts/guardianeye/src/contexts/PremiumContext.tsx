import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetMyProfile } from "@workspace/api-client-react";

type Tier = "basic" | "premium";

type Ctx = {
  tier: Tier;
  isPremium: boolean;
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
  const [demoTier, setDemoTier] = useState<Tier | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [feature, setFeature] = useState<string | null>(null);

  const { data: profile } = useGetMyProfile({ query: { enabled: !!user } as any });

  const serverTier: Tier = profile?.subscription_tier === "premium" ? "premium" : "basic";
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
