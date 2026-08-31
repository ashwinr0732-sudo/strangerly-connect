import { Check } from "lucide-react";
import { INTEREST_ICONS, INTERESTS } from "@/lib/interests";
import { cn } from "@/lib/utils";

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
}

export function InterestSelector({ selected, onToggle }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {INTERESTS.map((interest) => {
        const Icon = INTEREST_ICONS[interest.id]!;
        const active = selected.includes(interest.id);
        return (
          <button
            key={interest.id}
            type="button"
            onClick={() => onToggle(interest.id)}
            className={cn(
              "relative flex items-center gap-2.5 rounded-2xl border px-4 py-3.5 text-sm font-medium transition-all",
              active
                ? "border-primary bg-primary/15 glow"
                : "border-border bg-surface/50 hover:border-primary/40",
            )}
          >
            <Icon
              className={cn(
                "h-4.5 w-4.5",
                active ? "text-primary-glow" : "text-muted-foreground",
              )}
            />
            {interest.label}
            {active && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-gradient-primary">
                <Check className="h-3 w-3 text-primary-foreground" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
