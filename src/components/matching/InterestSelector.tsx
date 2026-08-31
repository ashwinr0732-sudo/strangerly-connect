import { Check } from "lucide-react";
import { INTERESTS, INTEREST_ICONS } from "@/lib/interests";
import { cn } from "@/lib/utils";

interface Props {
  selected: string[];
  disabled: boolean;
  onToggle: (id: string) => void;
}

export function InterestSelector({ selected, disabled, onToggle }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {INTERESTS.map((interest) => {
        const Icon = INTEREST_ICONS[interest.id];
        const active = selected.includes(interest.id);
        const lockedOut = disabled && !active;
        return (
          <button
            key={interest.id}
            type="button"
            disabled={lockedOut}
            onClick={() => onToggle(interest.id)}
            aria-pressed={active}
            className={cn(
              "relative flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-sm font-medium transition-all",
              active
                ? "border-primary bg-primary/15 text-foreground glow"
                : lockedOut
                  ? "cursor-not-allowed border-border/50 bg-surface/30 text-muted-foreground/50"
                  : "border-border bg-surface/50 text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-primary-glow" : "text-muted-foreground/70",
                )}
              />
            )}
            <span className="truncate">#{interest.id}</span>
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
