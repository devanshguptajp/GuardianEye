import { useMemo, useState } from "react";
import { useSelectedChild } from "@/contexts/SelectedChildContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone, Plus, Wifi, WifiOff, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { EmptyChildPrompt } from "./Apps";
import {
  useListDevices, useCreateDevice, useDeleteDevice,
  getListDevicesQueryKey, queryOpts, type CreateDeviceMutationResult, type CreateDeviceMutationError,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const Devices = () => {
  const { selectedId } = useSelectedChild();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [pairingCode, setPairingCode] = useState<string | null>(null);

  const { data: devices = [] } = useListDevices(selectedId!, { query: queryOpts({ enabled: !!selectedId }) });
  const createDevice = useCreateDevice();
  const deleteDevice = useDeleteDevice();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListDevicesQueryKey(selectedId!) });

  const generate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    createDevice.mutate(
      { childId: selectedId, data: { device_name: deviceName || "New device" } },
      {
        onSuccess: (data: CreateDeviceMutationResult) => {
          setPairingCode(data.pairing_code ?? null);
          setDeviceName("");
          invalidate();
        },
        onError: (err: CreateDeviceMutationError) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
      },
    );
  };

  const remove = (id: string) => {
    deleteDevice.mutate({ deviceId: id }, { onSuccess: invalidate });
  };

  const pairUrl = useMemo(() => pairingCode ? `${window.location.origin}/pair/${pairingCode}` : "", [pairingCode]);

  if (!selectedId) return <EmptyChildPrompt label="devices" />;

  return (
    <div className="p-6 lg:p-10 space-y-6 animate-fade-in">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Devices</h1>
          <p className="text-muted-foreground mt-1">Pair Android & iPhone devices to start monitoring.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setPairingCode(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground shadow-glow"><Plus className="h-4 w-4 mr-1" /> Pair device</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{pairingCode ? "Scan to pair" : "Pair a new device"}</DialogTitle></DialogHeader>
            {!pairingCode ? (
              <form onSubmit={generate} className="space-y-4">
                <div>
                  <Label htmlFor="dn">Device name</Label>
                  <Input id="dn" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} placeholder="Mia's iPhone" className="mt-1.5" />
                </div>
                <Button type="submit" disabled={createDevice.isPending} className="w-full bg-gradient-primary text-primary-foreground">Generate QR code</Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="mx-auto inline-block p-4 rounded-2xl bg-white">
                  <QRCodeSVG value={pairUrl} size={200} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Pairing code</div>
                  <div className="font-mono text-2xl font-bold mt-1">{pairingCode}</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Open the GuardianEye app on the child's device, scan this QR or enter the code above.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </header>

      {devices.length === 0 ? (
        <div className="ge-card p-12 text-center">
          <Smartphone className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-display font-semibold">No devices paired</h3>
          <p className="text-sm text-muted-foreground mt-1">Click "Pair device" above to get started.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((d) => {
            const online = d.status === "active" && d.last_seen && (Date.now() - new Date(d.last_seen).getTime() < 5 * 60 * 1000);
            return (
              <div key={d.id} className="ge-card p-5">
                <div className="flex items-start justify-between">
                  <div className="h-11 w-11 rounded-xl bg-gradient-primary/15 grid place-items-center text-primary">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="mt-3 font-display font-semibold">{d.device_name}</div>
                <div className="mt-1 text-xs text-muted-foreground capitalize">{d.platform ?? "Unknown platform"}</div>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  {online ? (
                    <><Wifi className="h-3.5 w-3.5 text-success" /><span className="text-success font-medium">Online</span></>
                  ) : d.status === "pending" ? (
                    <><WifiOff className="h-3.5 w-3.5 text-warning" /><span className="text-warning font-medium">Awaiting pairing</span></>
                  ) : (
                    <><WifiOff className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">{d.last_seen ? formatDistanceToNow(new Date(d.last_seen), { addSuffix: true }) : "Never seen"}</span></>
                  )}
                </div>
                {d.pairing_code && d.status === "pending" && (
                  <div className="mt-3 text-xs font-mono bg-secondary px-3 py-2 rounded-lg text-center">{d.pairing_code}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Devices;
