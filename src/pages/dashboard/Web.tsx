import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSelectedChild } from "@/contexts/SelectedChildContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Plus, Trash2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmptyChildPrompt } from "./Apps";
import { usePremium } from "@/contexts/PremiumContext";
import { PremiumBadge } from "@/components/premium/PremiumGate";

const presets = ["adult", "gambling", "violence", "drugs"];

const Web = () => {
  const { selectedId } = useSelectedChild();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPremium, openUpgrade } = usePremium();
  const [items, setItems] = useState<any[]>([]);
  const [domain, setDomain] = useState("");

  const load = async () => {
    if (!selectedId) return;
    const { data } = await supabase.from("web_blocklist").select("*").eq("child_id", selectedId).order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, [selectedId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedId || !domain) return;
    const { error } = await supabase.from("web_blocklist").insert({ parent_id: user.id, child_id: selectedId, domain });
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setDomain(""); load();
  };

  const addCategory = async (cat: string) => {
    if (!isPremium) return openUpgrade("category-based web filtering");
    if (!user || !selectedId) return;
    await supabase.from("web_blocklist").insert({ parent_id: user.id, child_id: selectedId, domain: `*.${cat}`, category: cat });
    load();
  };

  const remove = async (id: string) => { await supabase.from("web_blocklist").delete().eq("id", id); load(); };

  if (!selectedId) return <EmptyChildPrompt label="web filters" />;

  return (
    <div className="p-6 lg:p-10 space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-3xl font-bold">Web filter</h1>
        <p className="text-muted-foreground mt-1">Block specific sites or whole categories.</p>
      </header>

      <div className="ge-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <Label>Quick categories</Label>
          {!isPremium && <PremiumBadge />}
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <Button
              key={p}
              variant="outline"
              size="sm"
              onClick={() => addCategory(p)}
              className={`capitalize ${!isPremium ? "opacity-70" : ""}`}
            >
              {!isPremium && <Lock className="h-3 w-3 mr-1" />}
              + {p}
            </Button>
          ))}
        </div>
      </div>

      <form onSubmit={add} className="ge-card p-4 flex gap-2 items-end">
        <div className="flex-1">
          <Label htmlFor="dom">Block a domain</Label>
          <Input id="dom" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" className="mt-1.5" />
        </div>
        <Button type="submit" className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Block</Button>
      </form>

      {items.length === 0 ? (
        <div className="ge-card p-12 text-center text-muted-foreground">Nothing blocked yet.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="ge-card px-5 py-3 flex items-center gap-3">
              <Globe className="h-4 w-4 text-primary" />
              <span className="font-medium flex-1">{it.domain}</span>
              {it.category && <span className="text-xs text-muted-foreground capitalize">{it.category}</span>}
              <Button size="icon" variant="ghost" onClick={() => remove(it.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Web;
