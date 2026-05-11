import { useEffect, useState } from "react";
import { Trash2, ShieldAlert, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useChildren } from "@/hooks/useChildren";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSelectedChild } from "@/contexts/SelectedChildContext";

/** Lightweight non-secret-grade hash for the local parent PIN gate. */
const hashPin = async (parentId: string, pin: string) => {
  const enc = new TextEncoder().encode(`${parentId}:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const DeleteChildSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { children, refresh } = useChildren();
  const { selectedId, setSelectedId } = useSelectedChild();

  const [pinSet, setPinSet] = useState<boolean>(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPin2, setNewPin2] = useState("");

  const [childId, setChildId] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);
  const [pin, setPin] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("pin_hash").eq("id", user.id).maybeSingle();
      setPinSet(!!data?.pin_hash);
    })();
  }, [user]);

  const savePin = async () => {
    if (!user) return;
    if (!/^\d{4,8}$/.test(newPin)) return toast({ title: "PIN must be 4–8 digits", variant: "destructive" });
    if (newPin !== newPin2) return toast({ title: "PINs don't match", variant: "destructive" });

    // If a PIN already exists, require the old one first.
    if (pinSet) {
      if (!/^\d{4,8}$/.test(oldPin)) return toast({ title: "Enter your current PIN", variant: "destructive" });
      const { data: prof } = await supabase.from("profiles").select("pin_hash").eq("id", user.id).maybeSingle();
      const oldH = await hashPin(user.id, oldPin);
      if (!prof?.pin_hash || prof.pin_hash !== oldH) {
        return toast({ title: "Current PIN is incorrect", variant: "destructive" });
      }
    }

    const h = await hashPin(user.id, newPin);
    const { error } = await supabase.from("profiles").update({ pin_hash: h }).eq("id", user.id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setPinSet(true);
    setPinDialogOpen(false);
    setOldPin(""); setNewPin(""); setNewPin2("");
    toast({ title: "Parent PIN updated" });
  };

  const openConfirm = () => {
    if (!childId) return toast({ title: "Choose a child first" });
    setConfirmed(false);
    setPin("");
    setOpen(true);
  };

  const doDelete = async () => {
    if (!user || !childId) return;
    if (!confirmed) return toast({ title: "Tick the confirmation box" });
    if (!/^\d{4,8}$/.test(pin)) return toast({ title: "Enter your parent PIN", variant: "destructive" });
    setBusy(true);
    const { data: prof } = await supabase.from("profiles").select("pin_hash").eq("id", user.id).maybeSingle();
    const h = await hashPin(user.id, pin);
    if (!prof?.pin_hash || prof.pin_hash !== h) {
      setBusy(false);
      return toast({ title: "Incorrect PIN", variant: "destructive" });
    }
    // Cascade: remove all child-scoped data first (no FK cascades in schema).
    const tasks = [
      supabase.from("activity_events").delete().eq("child_id", childId),
      supabase.from("alerts").delete().eq("child_id", childId),
      supabase.from("app_limits").delete().eq("child_id", childId),
      supabase.from("devices").delete().eq("child_id", childId),
      supabase.from("locations").delete().eq("child_id", childId),
      supabase.from("web_blocklist").delete().eq("child_id", childId),
    ];
    await Promise.all(tasks);
    const { error } = await supabase.from("children").delete().eq("id", childId);
    setBusy(false);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    if (selectedId === childId) setSelectedId(null);
    setOpen(false);
    setChildId("");
    refresh();
    toast({ title: "Child profile deleted" });
  };

  const childName = children.find((c) => c.id === childId)?.name ?? "this child";

  return (
    <section className="ge-card p-6 space-y-4 border-destructive/30">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-destructive" />
        <h2 className="font-display font-semibold">Danger zone</h2>
      </div>

      {/* Parent PIN setup */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          Parent PIN: <span className={pinSet ? "text-success font-medium" : "text-warning font-medium"}>
            {pinSet ? "set" : "not set"}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setPinDialogOpen(true)}>
          {pinSet ? "Change PIN" : "Set PIN"}
        </Button>
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <div>
          <Label>Delete a child profile</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Permanently removes the child and all their devices, alerts, app limits, locations and web blocklist.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={childId} onValueChange={setChildId}>
            <SelectTrigger className="sm:flex-1"><SelectValue placeholder="Select a child" /></SelectTrigger>
            <SelectContent>
              {children.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">No children yet</div>
              ) : children.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="destructive" onClick={openConfirm} disabled={!childId || !pinSet}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
        {!pinSet && (
          <p className="text-xs text-warning">Set a Parent PIN above before you can delete a child profile.</p>
        )}
      </div>

      {/* PIN setup dialog */}
      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{pinSet ? "Change Parent PIN" : "Set Parent PIN"}</DialogTitle>
            <DialogDescription>4–8 digits. Required for sensitive actions like deleting a child.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="np">New PIN</Label>
              <Input id="np" type="password" inputMode="numeric" maxLength={8} value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="np2">Confirm PIN</Label>
              <Input id="np2" type="password" inputMode="numeric" maxLength={8} value={newPin2}
                onChange={(e) => setNewPin2(e.target.value.replace(/\D/g, ""))} className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPinDialogOpen(false)}>Cancel</Button>
            <Button onClick={savePin} className="bg-gradient-primary text-primary-foreground">Save PIN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" /> Delete {childName}?
            </DialogTitle>
            <DialogDescription>
              This is permanent. All paired devices, alerts, app limits, location history and web blocklist
              entries for {childName} will be erased.
            </DialogDescription>
          </DialogHeader>

          <label className="flex items-start gap-2.5 text-sm cursor-pointer p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(!!v)} className="mt-0.5" />
            <span>I understand this action cannot be undone and will delete <b>{childName}</b> and all related data.</span>
          </label>

          <div>
            <Label htmlFor="pin">Enter your Parent PIN</Label>
            <Input id="pin" type="password" inputMode="numeric" maxLength={8} value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} className="mt-1.5" autoFocus />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={doDelete} disabled={!confirmed || busy}>
              {busy ? "Deleting…" : "Delete forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
