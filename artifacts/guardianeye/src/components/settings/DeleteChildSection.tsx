import { useEffect, useState } from "react";
import { Trash2, ShieldAlert, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useChildren } from "@/hooks/useChildren";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSelectedChild } from "@/contexts/SelectedChildContext";
import {
  useGetMyProfile, useSetPin, useVerifyPin, useDeleteChild, getListChildrenQueryKey, queryOpts,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  const { data: profile } = useGetMyProfile({ query: queryOpts({ enabled: !!user }) });
  const setPin = useSetPin();
  const verifyPin = useVerifyPin();
  const deleteChild = useDeleteChild();

  const pinSet = !!profile?.pin_hash;

  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPin2, setNewPin2] = useState("");

  const [childId, setChildId] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);
  const [pin, setPin_] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const savePin = async (): Promise<void> => {
    if (!user) return;
    if (!/^\d{4,8}$/.test(newPin)) { toast({ title: "PIN must be 4–8 digits", variant: "destructive" }); return; }
    if (newPin !== newPin2) { toast({ title: "PINs don't match", variant: "destructive" }); return; }

    if (pinSet) {
      if (!/^\d{4,8}$/.test(oldPin)) { toast({ title: "Enter your current PIN", variant: "destructive" }); return; }
      const oldH = await hashPin(user.id, oldPin);
      const result = await new Promise<{ valid: boolean }>((resolve, reject) => {
        verifyPin.mutate({ data: { pin_hash: oldH } }, { onSuccess: resolve, onError: reject });
      }).catch(() => ({ valid: false }));
      if (!result.valid) { toast({ title: "Current PIN is incorrect", variant: "destructive" }); return; }
    }

    const h = await hashPin(user.id, newPin);
    setPin.mutate({ data: { pin_hash: h } }, {
      onSuccess: () => {
        setPinDialogOpen(false);
        setOldPin(""); setNewPin(""); setNewPin2("");
        toast({ title: "Parent PIN updated" });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const openConfirm = (): void => {
    if (!childId) { toast({ title: "Choose a child first" }); return; }
    setConfirmed(false); setPin_(""); setOpen(true);
  };

  const doDelete = async (): Promise<void> => {
    if (!user || !childId) return;
    if (!confirmed) { toast({ title: "Tick the confirmation box" }); return; }
    if (!/^\d{4,8}$/.test(pin)) { toast({ title: "Enter your parent PIN", variant: "destructive" }); return; }
    setBusy(true);
    const h = await hashPin(user.id, pin);
    const result = await new Promise<{ valid: boolean }>((resolve, reject) => {
      verifyPin.mutate({ data: { pin_hash: h } }, { onSuccess: resolve, onError: reject });
    }).catch(() => ({ valid: false }));
    if (!result.valid) {
      setBusy(false);
      toast({ title: "Incorrect PIN", variant: "destructive" });
      return;
    }
    deleteChild.mutate({ childId }, {
      onSuccess: () => {
        setBusy(false);
        if (selectedId === childId) setSelectedId(null);
        setOpen(false); setChildId("");
        queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey() });
        refresh();
        toast({ title: "Child profile deleted" });
      },
      onError: (err: any) => {
        setBusy(false);
        toast({ title: "Failed", description: err.message, variant: "destructive" });
      },
    });
  };

  const childName = children.find((c) => c.id === childId)?.name ?? "this child";

  return (
    <section className="ge-card p-6 space-y-4 border-destructive/30">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-destructive" />
        <h2 className="font-display font-semibold">Danger zone</h2>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          Parent PIN: <span className={pinSet ? "text-success font-medium" : "text-warning font-medium"}>
            {pinSet ? "active" : "missing — set one now"}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setPinDialogOpen(true)}>
          {pinSet ? "Change PIN" : "Set PIN"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Your PIN approves sensitive actions: changing time limits or settings from your child's phone,
        granting extra time, and unlocking parent mode.
      </p>

      <div className="border-t border-border pt-4 space-y-3">
        <div>
          <Label>Delete a child profile</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Permanently removes the child and all their devices, alerts, app limits, and web blocklist.
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
        {!pinSet && <p className="text-xs text-warning">Set a Parent PIN above before you can delete a child profile.</p>}
      </div>

      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{pinSet ? "Change Parent PIN" : "Set Parent PIN"}</DialogTitle>
            <DialogDescription>
              {pinSet ? "Enter your current PIN, then choose a new 4–8 digit PIN." : "Choose a 4–8 digit PIN."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {pinSet && (
              <div>
                <Label htmlFor="op">Current PIN</Label>
                <Input id="op" type="password" inputMode="numeric" maxLength={8} value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ""))} className="mt-1.5" autoFocus />
              </div>
            )}
            <div>
              <Label htmlFor="np">New PIN</Label>
              <Input id="np" type="password" inputMode="numeric" maxLength={8} value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="np2">Confirm new PIN</Label>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" /> Delete {childName}?
            </DialogTitle>
            <DialogDescription>
              This is permanent. All paired devices, alerts, app limits, and web blocklist entries for {childName} will be erased.
            </DialogDescription>
          </DialogHeader>

          <label className="flex items-start gap-2.5 text-sm cursor-pointer p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(!!v)} className="mt-0.5" />
            <span>I understand this action cannot be undone and will delete <b>{childName}</b> and all related data.</span>
          </label>

          <div>
            <Label htmlFor="pin">Enter your Parent PIN</Label>
            <Input id="pin" type="password" inputMode="numeric" maxLength={8} value={pin}
              onChange={(e) => setPin_(e.target.value.replace(/\D/g, ""))} className="mt-1.5" autoFocus />
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
