import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export const Logo = ({ className, withText = true }: { className?: string; withText?: boolean }) => (
  <div className={cn("inline-flex items-center gap-2.5", className)}>
    <div className="relative">
      <div className="absolute inset-0 rounded-xl bg-gradient-primary blur-md opacity-70 animate-pulse-soft" />
      <div className="relative h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
        <Eye className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
    </div>
    {withText && (
      <span className="font-display font-bold text-lg tracking-tight">
        Guardian<span className="ge-gradient-text">Eye</span>
      </span>
    )}
  </div>
);
