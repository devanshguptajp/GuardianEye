import { useState } from "react";
import { Plus, ChevronDown, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useSelectedChild } from "@/contexts/SelectedChildContext";
import { usePremium } from "@/contexts/PremiumContext";
import { PremiumBadge } from "@/components/premium/PremiumGate";
import type { Child } from "@/hooks/useChildren";
import { useCreateChild, getListChildrenQueryKey, type CreateChildMutationResult, type CreateChildMutationError } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export const ChildSwitcher = ({ children, onChildrenChange }: { children: Child[]; onChildrenChange: () => void }) => {
  const { selectedId, setSelectedId } = useSelectedChild();
  const { toast } = useToast();
  const { isPremium, openUpgrade } = usePremium();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");

  const createChild = useCreateChild();
  const selected = children.find((c) => c.id === selectedId) ?? children[0];

  const addChild = (e: React.FormEvent) => {
    e.preventDefault();
    createChild.mutate(
      { data: { name, birth_year: year ? parseInt(year) : undefined } },
      {
        onSuccess: (data: CreateChildMutationResult) => {
          setName(""); setYear(""); setOpen(false);
          queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey() });
          onChildrenChange();
          if (data?.id) setSelectedId(data.id);
          toast({ title: "Child added", description: `${data?.name} is ready to be paired.` });
        },
        onError: (err: CreateChildMutationError) => {
          toast({ title: "Could not add", description: err.message, variant: "destructive" });
        },
      },
    );
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
          <DropdownMenuItem
            onClick={(e) => {
              if (!isPremium && children.length >= 1) {
                e.preventDefault();
                openUpgrade("unlimited children");
                return;
              }
              setOpen(true);
            }}
          >
            {!isPremium && children.length >= 1 ? <Lock className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Add child
            {!isPremium && children.length >= 1 && <PremiumBadge className="ml-auto" />}
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
              <Button type="submit" disabled={createChild.isPending} className="bg-gradient-primary text-primary-foreground">
                {createChild.isPending ? "Adding…" : "Add child"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
