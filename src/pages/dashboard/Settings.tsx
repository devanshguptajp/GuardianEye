import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { Crown, ShieldCheck, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
      setName(data?.display_name ?? "");
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", user.id);
    setBusy(false);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Saved" });
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-2xl animate-fade-in">
      <h1 className="font-display text-3xl font-bold">Settings</h1>

      <section className="ge-card p-6 space-y-4">
        <h2 className="font-display font-semibold">Profile</h2>
        <div>
          <Label htmlFor="dn">Display name</Label>
          <Input id="dn" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled className="mt-1.5" />
        </div>
        <Button onClick={save} disabled={busy} className="bg-gradient-primary text-primary-foreground">{busy ? "Saving…" : "Save"}</Button>
      </section>

      <section className="ge-card p-6 space-y-4">
        <h2 className="font-display font-semibold">Appearance</h2>
        <Button variant="outline" onClick={toggle}>Switch to {theme === "dark" ? "light" : "dark"} mode</Button>
      </section>

      <section className="ge-card p-6 space-y-4 relative overflow-hidden">
        <div className="absolute inset-0 ge-aurora opacity-30 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold">GuardianEye Premium</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">AI moderation, live location history and unlimited children.</p>
          <Button className="mt-4 bg-gradient-primary text-primary-foreground shadow-glow">Upgrade — $9.99/mo</Button>
        </div>
      </section>

      <section className="ge-card p-6 space-y-3">
        <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-accent" /><h2 className="font-display font-semibold">Security</h2></div>
        <Button variant="outline" onClick={async () => { await signOut(); navigate("/"); }}>
          <LogOut className="h-4 w-4 mr-2" /> Sign out everywhere
        </Button>
      </section>
    </div>
  );
};

export default Settings;
