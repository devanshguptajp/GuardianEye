import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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
  const [tier, setTierState] = useState<Tier>(() => {
    if (typeof window === "undefined") return "basic";
    return (localStorage.getItem("ge-tier") as Tier) ?? "basic";
  });
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [feature, setFeature] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("ge-tier", tier);
  }, [tier]);

  return (
    <PremiumCtx.Provider
      value={{
        tier,
        isPremium: tier === "premium",
        setTier: setTierState,
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
