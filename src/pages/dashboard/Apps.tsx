import { useEffect, useState } from "react";
import { useSelectedChild } from "@/contexts/SelectedChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Plus, Smartphone, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Apps = () => {
  const { selectedId } = useSelectedChild();
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [appName, setAppName] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    if (!selectedId) return;
    const { data } = await supabase.from("app_limits").select("*").eq("child_id", selectedId).order("created_at");
    setItems(data ?? []);
  };

  useEffect(() => { load(); }, [selectedId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedId || !appName) return;
    setAdding(true);
    const { error } = await supabase.from("app_limits").insert({
      parent_id: user.id, child_id: selectedId, app_name: appName, daily_minutes: 60,
    });
    setAdding(false);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setAppName(""); load();
  };

  const update = async (id: string, patch: any) => {
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    await supabase.from("app_limits").update(patch).eq("id", id);
  };

  const remove = async (id: string) => {
    await supabase.from("app_limits").delete().eq("id", id);
    load();
  };

  if (!selectedId) return <EmptyChildPrompt label="app limits" />;

  return (
    <div className="p-6 lg:p-10 space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-3xl font-bold">App limits</h1>
        <p className="text-muted-foreground mt-1">Set daily time or block apps entirely.</p>
      </header>

      <form onSubmit={add} className="ge-card p-4 flex gap-2 items-end">
        <div className="flex-1">
          <Label htmlFor="app">Add an app</Label>
          <Input id="app" value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="TikTok, Roblox, Instagram…" className="mt-1.5" />
        </div>
        <Button type="submit" disabled={adding || !appName} className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </form>

      {items.length === 0 ? (
        <div className="ge-card p-12 text-center text-muted-foreground">No apps configured yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="ge-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 sm:w-56">
                <div className="h-10 w-10 rounded-xl bg-gradient-primary/15 grid place-items-center text-primary">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div className="font-medium">{it.app_name}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Daily limit</span>
                  <span className="font-medium text-foreground">{it.blocked ? "Blocked" : `${it.daily_minutes} min`}</span>
                </div>
                <Slider
                  value={[it.daily_minutes]}
                  min={5} max={240} step={5}
                  disabled={it.blocked}
                  onValueChange={(v) => update(it.id, { daily_minutes: v[0] })}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={it.blocked} onCheckedChange={(v) => update(it.id, { blocked: v })} />
                  <span className="text-xs text-muted-foreground">Block</span>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(it.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const EmptyChildPrompt = ({ label }: { label: string }) => (
  <div className="p-10 text-center text-muted-foreground">Add a child first to manage {label}.</div>
);

export default Apps;
