import { MapPin } from "lucide-react";
import { useSelectedChild } from "@/contexts/SelectedChildContext";
import { EmptyChildPrompt } from "./Apps";

const Location = () => {
  const { selectedId } = useSelectedChild();
  if (!selectedId) return <EmptyChildPrompt label="location" />;

  return (
    <div className="p-6 lg:p-10 space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-3xl font-bold">Live location</h1>
        <p className="text-muted-foreground mt-1">Real-time location and history map.</p>
      </header>

      <div className="ge-card p-0 overflow-hidden">
        <div className="aspect-[16/9] relative grid place-items-center bg-gradient-to-br from-secondary to-card">
          <div className="absolute inset-0 ge-aurora opacity-30" />
          <div className="relative text-center">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-primary grid place-items-center shadow-glow animate-pulse-soft">
              <MapPin className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="font-display font-semibold mt-4">Map view</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Live location appears here once a paired device starts reporting.
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Last known", value: "—" },
          { label: "Updated", value: "Awaiting device" },
          { label: "Accuracy", value: "—" },
        ].map((s) => (
          <div key={s.label} className="ge-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-2 font-display text-xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Location;
