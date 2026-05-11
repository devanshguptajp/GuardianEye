import { useState } from "react";
import { useSelectedChild } from "@/contexts/SelectedChildContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Plus, Trash2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmptyChildPrompt } from "./Apps";
import { usePremium } from "@/contexts/PremiumContext";
import { PremiumBadge } from "@/components/premium/PremiumGate";
import {
  useListWebBlocklist, useAddWebBlocklistEntry, useDeleteWebBlocklistEntry,
  getListWebBlocklistQueryKey, queryOpts, type AddWebBlocklistEntryMutationError,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const presets = ["adult", "gambling", "violence", "drugs"];

const Web = () => {
  const { selectedId } = useSelectedChild();
  const { toast } = useToast();
  const { isPremium, openUpgrade } = usePremium();
  const queryClient = useQueryClient();
  const [domain, setDomain] = useState("");

  const { data: items = [] } = useListWebBlocklist(selectedId!, { query: queryOpts({ enabled: !!selectedId }) });
  const addEntry = useAddWebBlocklistEntry();
  const deleteEntry = useDeleteWebBlocklistEntry();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListWebBlocklistQueryKey(selectedId!) });

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !domain) return;
    addEntry.mutate({ childId: selectedId, data: { domain } }, {
      onSuccess: () => { setDomain(""); invalidate(); },
      onError: (err: AddWebBlocklistEntryMutationError) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const addCategory = (cat: string) => {
    if (!isPremium) return openUpgrade("category-based web filtering");
    if (!selectedId) return;
    addEntry.mutate({ childId: selectedId, data: { domain: `*.${cat}`, category: cat } }, { onSuccess: invalidate });
  };

  const remove = (id: string) => {
    deleteEntry.mutate({ entryId: id }, { onSuccess: invalidate });
  };

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
            <Button key={p} variant="outline" size="sm" onClick={() => addCategory(p)} className={`capitalize ${!isPremium ? "opacity-70" : ""}`}>
              {!isPremium && <Lock className="h-3 w-3 mr-1" />}+ {p}
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
