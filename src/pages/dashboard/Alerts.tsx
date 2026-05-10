import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSelectedChild } from "@/contexts/SelectedChildContext";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { EmptyChildPrompt } from "./Apps";

const Alerts = () => {
  const { selectedId } = useSelectedChild();
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    if (!selectedId) return;
    const { data } = await supabase.from("alerts").select("*").eq("child_id", selectedId).order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => {
    load();
    if (!selectedId) return;
    const ch = supabase.channel(`alerts-page-${selectedId}`).on("postgres_changes", {
      event: "*", schema: "public", table: "alerts", filter: `child_id=eq.${selectedId}`,
    }, () => load()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selectedId]);

  const markRead = async (id: string) => { await supabase.from("alerts").update({ read: true }).eq("id", id); load(); };

  if (!selectedId) return <EmptyChildPrompt label="alerts" />;

  return (
    <div className="p-6 lg:p-10 space-y-6 animate-fade-in">
      <h1 className="font-display text-3xl font-bold">Alerts</h1>
      {items.length === 0 ? (
        <div className="ge-card p-12 text-center text-muted-foreground">
          <Bell className="h-10 w-10 mx-auto mb-3 opacity-50" />
          No alerts yet. You'll be notified instantly when something needs attention.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.id} className={`ge-card p-5 flex gap-4 ${!a.read ? "border-primary/40" : ""}`}>
              <div className={`h-10 w-10 rounded-xl shrink-0 grid place-items-center ${
                a.severity === "high" ? "bg-destructive/15 text-destructive" :
                a.severity === "warning" ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary"
              }`}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{a.title}</div>
                {a.description && <div className="text-sm text-muted-foreground mt-0.5">{a.description}</div>}
                <div className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</div>
              </div>
              {!a.read && <Button size="sm" variant="ghost" onClick={() => markRead(a.id)}><Check className="h-4 w-4" /></Button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Alerts;
