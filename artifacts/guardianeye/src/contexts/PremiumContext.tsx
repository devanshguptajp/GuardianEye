import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetMyProfile, queryOpts } from "@workspace/api-client-react";

type Tier = "basic" | "premium";

type Ctx = {
  tier: Tier;
  isPremium: boolean;
  isOnTrial: boolean;
  trialDaysLeft: number;
  trialEndsAt: Date | null;
  upgradeOpen: boolean;
  openUpgrade: (feature?: string) => void;
  closeUpgrade: () => void;
  feature: string | null;
};

const PremiumCtx = createContext<Ctx>({
  tier: "basic",
  isPremium: false,
  isOnTrial: false,
  trialDaysLeft: 0,
  trialEndsAt: null,
  upgradeOpen: false,
  openUpgrade: () => {},
  closeUpgrade: () => {},
  feature: null,
});

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [feature, setFeature] = useState<string | null>(null);

  const { data: profile } = useGetMyProfile({ query: queryOpts({ enabled: !!user }) });

  const now = new Date();
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const isOnTrial = trialEndsAt ? trialEndsAt > now : false;
  const trialDaysLeft = isOnTrial && trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const tier: Tier = isOnTrial || profile?.subscription_tier === "premium" ? "premium" : "basic";

  return (
    <PremiumCtx.Provider
      value={{
        tier,
        isPremium: tier === "premium",
        isOnTrial,
        trialDaysLeft,
        trialEndsAt,
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
