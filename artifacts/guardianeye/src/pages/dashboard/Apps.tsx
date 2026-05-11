import { useState } from "react";
import { useSelectedChild } from "@/contexts/SelectedChildContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Plus, Smartphone, Trash2, Lock, ShieldAlert, History, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePremium } from "@/contexts/PremiumContext";
import { PremiumBadge } from "@/components/premium/PremiumGate";
import {
  useListAppLimits, useCreateAppLimit, useUpdateAppLimit, useDeleteAppLimit, useListAppUsage,
  getListAppLimitsQueryKey, queryOpts, type CreateAppLimitMutationError,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

type Tab = "limits" | "history";

const Apps = () => {
  const { selectedId } = useSelectedChild();
  const { toast } = useToast();
  const { isPremium, openUpgrade } = usePremium();
  const queryClient = useQueryClient();
  const [appName, setAppName] = useState("");
  const [tab, setTab] = useState<Tab>("limits");

  const { data: items = [] } = useListAppLimits(selectedId!, { query: queryOpts({ enabled: !!selectedId }) });
  const { data: usageLogs = [] } = useListAppUsage(selectedId!, { query: queryOpts({ enabled: !!selectedId && tab === "history" }) });
  const createLimit = useCreateAppLimit();
  const updateLimit = useUpdateAppLimit();
  const deleteLimit = useDeleteAppLimit();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListAppLimitsQueryKey(selectedId!) });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !appName) return;
    createLimit.mutate(
      { childId: selectedId, data: { app_name: appName, daily_minutes: 60 } },
      {
        onSuccess: () => { setAppName(""); invalidate(); },
        onError: (err: CreateAppLimitMutationError) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
      },
    );
  };

  const update = (id: string, patch: { daily_minutes?: number; blocked?: boolean }) => {
    updateLimit.mutate({ limitId: id, data: patch }, { onSuccess: invalidate });
  };

  const remove = (id: string) => {
    deleteLimit.mutate({ limitId: id }, { onSuccess: invalidate });
  };

  if (!selectedId) return <EmptyChildPrompt label="app limits" />;

  return (
    <div className="p-6 lg:p-10 space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-3xl font-bold">App limits</h1>
        <p className="text-muted-foreground mt-1">Set daily time or block apps entirely. Usage history is kept even after removing an app.</p>
      </header>

      <div className={`ge-card p-4 flex items-start sm:items-center gap-3 ${isPremium ? "border-accent/40 bg-accent/5" : ""}`}>
        <div className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${isPremium ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"}`}>
          {isPremium ? <ShieldAlert className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">Auto-lock when daily limit is reached</span>
            {!isPremium && <PremiumBadge />}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isPremium
              ? "Active — apps are automatically blocked on the child's device the moment their limit is hit."
              : "Today, time-up only sends an alert. Upgrade to Pro to enforce automatic blocking on the device."}
          </p>
        </div>
        {!isPremium && (
          <Button size="sm" variant="outline" onClick={() => openUpgrade("automatic app locking")}>Unlock</Button>
        )}
      </div>

      <div className="flex border-b border-border/60">
        <button
          onClick={() => setTab("limits")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${tab === "limits" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Smartphone className="h-3.5 w-3.5 inline mr-1.5" /> App limits
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${tab === "history" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <History className="h-3.5 w-3.5 inline mr-1.5" /> Usage history
        </button>
      </div>

      {tab === "limits" && (
        <>
          <form onSubmit={add} className="ge-card p-4 flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="app">Add an app</Label>
              <Input id="app" value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="TikTok, Roblox, Instagram…" className="mt-1.5" />
            </div>
            <Button type="submit" disabled={createLimit.isPending || !appName} className="bg-gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
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
                    <Button size="icon" variant="ghost" onClick={() => remove(it.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Usage records are preserved even after an app limit is removed, so you always have a full history.
          </p>
          {usageLogs.length === 0 ? (
            <div className="ge-card p-12 text-center text-muted-foreground">
              No usage data yet. Usage is logged as devices report activity.
            </div>
          ) : (
            <div className="space-y-2">
              {usageLogs.map((log) => (
                <div key={log.id} className="ge-card p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-primary/10 grid place-items-center text-primary shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{log.app_name}</div>
                    <div className="text-xs text-muted-foreground">{log.date}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-medium">{log.minutes_used} min</div>
                    <div className="text-xs text-muted-foreground">{Math.floor(log.minutes_used / 60)}h {log.minutes_used % 60}m</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const EmptyChildPrompt = ({ label }: { label: string }) => (
  <div className="p-10 text-center text-muted-foreground">Add a child first to manage {label}.</div>
);

export default Apps;
