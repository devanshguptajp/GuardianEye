import { createContext, useContext, ReactNode } from "react";
import { useUser, useClerk } from "@clerk/react";

interface AuthCtx {
  user: { id: string; email?: string; name?: string } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true, signOut: async () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const value: AuthCtx = {
    user: user
      ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName ?? user.firstName ?? undefined,
        }
      : null,
    loading: !isLoaded,
    signOut: async () => { await signOut(); },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
