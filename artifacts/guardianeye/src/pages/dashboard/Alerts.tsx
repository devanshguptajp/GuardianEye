import { useSelectedChild } from "@/contexts/SelectedChildContext";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { EmptyChildPrompt } from "./Apps";
import { PremiumGate } from "@/components/premium/PremiumGate";
import { useListAlerts, useMarkAlertRead, getListAlertsQueryKey, queryOpts } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const Alerts = () => {
  const { selectedId } = useSelectedChild();
  const queryClient = useQueryClient();
  const { data: items = [] } = useListAlerts(selectedId!, { query: queryOpts({ enabled: !!selectedId }) });
  const markRead = useMarkAlertRead();

  const handleMarkRead = (id: string) => {
    markRead.mutate({ alertId: id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey(selectedId!) }),
    });
  };

  if (!selectedId) return <EmptyChildPrompt label="alerts" />;

  return (
    <div className="p-6 lg:p-10 space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-3xl font-bold">Alerts</h1>
        <p className="text-muted-foreground mt-1">AI-powered safety alerts in real time.</p>
      </header>
      <PremiumGate feature="AI safety alerts">
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
                {!a.read && <Button size="sm" variant="ghost" onClick={() => handleMarkRead(a.id)}><Check className="h-4 w-4" /></Button>}
              </li>
            ))}
          </ul>
        )}
      </PremiumGate>
    </div>
  );
};

export default Alerts;
