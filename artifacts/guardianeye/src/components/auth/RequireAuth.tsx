import { Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Redirect to="/sign-in" />;
  return <>{children}</>;
};

export const RedirectIfAuthed = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Redirect to="/app" />;
  return <>{children}</>;
};
