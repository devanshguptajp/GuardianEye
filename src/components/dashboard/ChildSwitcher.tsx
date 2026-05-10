import { useState } from "react";
import { Plus, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSelectedChild } from "@/contexts/SelectedChildContext";
import type { Child } from "@/hooks/useChildren";

export const ChildSwitcher = ({ children, onChildrenChange }: { children: Child[]; onChildrenChange: () => void }) => {
  const { selectedId, setSelectedId } = useSelectedChild();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [busy, setBusy] = useState(false);

  const selected = children.find((c) => c.id === selectedId) ?? children[0];

  const addChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { data, error } = await supabase.from("children").insert({
      parent_id: user.id, name, birth_year: year ? parseInt(year) : null,
    }).select().single();
    setBusy(false);
    if (error) {
      toast({ title: "Could not add", description: error.message, variant: "destructive" });
      return;
    }
    setName(""); setYear(""); setOpen(false);
    onChildrenChange();
    if (data) setSelectedId(data.id);
    toast({ title: "Child added", description: `${data?.name} is ready to be paired.` });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full ge-card p-3 flex items-center gap-3 hover:border-primary/40 transition-colors">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center text-primary-foreground font-semibold text-sm shrink-0">
              {selected ? selected.name.slice(0, 1).toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs text-muted-foreground">Viewing</div>
              <div className="font-medium text-sm truncate">{selected?.name ?? "No child yet"}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {children.map((c) => (
            <DropdownMenuItem key={c.id} onClick={() => setSelectedId(c.id)}>
              <div className="h-7 w-7 rounded-lg bg-gradient-primary grid place-items-center text-primary-foreground font-semibold text-xs mr-2">
                {c.name.slice(0, 1).toUpperCase()}
              </div>
              {c.name}
            </DropdownMenuItem>
          ))}
          {children.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add child
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add a child</DialogTitle></DialogHeader>
          <form onSubmit={addChild} className="space-y-4">
            <div>
              <Label htmlFor="cname">Name</Label>
              <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Mia" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="cyear">Birth year (optional)</Label>
              <Input id="cyear" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2014" className="mt-1.5" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={busy} className="bg-gradient-primary text-primary-foreground">
                {busy ? "Adding…" : "Add child"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
