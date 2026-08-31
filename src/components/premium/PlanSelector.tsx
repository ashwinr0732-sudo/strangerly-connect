import { Check, Flame } from "lucide-react";
import { PREMIUM_PLANS } from "@/lib/interests";
import { cn } from "@/lib/utils";
import type { PremiumPlanId } from "@/types";

interface Props {
  value: PremiumPlanId;
  onChange: (id: PremiumPlanId) => void;
  className?: string;
}

export function PlanSelector({ value, onChange, className }: Props) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {PREMIUM_PLANS.map((plan) => {
        const selected = plan.id === value;
        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => onChange(plan.id)}
            className={cn(
              "relative rounded-2xl border p-5 text-center transition-all",
              selected
                ? "border-primary bg-primary/10 glow"
                : "border-border bg-surface/50 hover:border-primary/40",
            )}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                <Flame className="h-3 w-3" /> Most Popular
              </span>
            )}
            <div className="flex items-center justify-center gap-2">
              <span className="font-semibold">{plan.name}</span>
              {plan.badge && (
                <span className="rounded-md bg-success/15 px-1.5 py-0.5 text-[11px] font-semibold text-success">
                  {plan.badge}
                </span>
              )}
            </div>
            <div className="mt-3 text-3xl font-extrabold tracking-tight">
              <span className="mr-0.5 text-xl align-top">{plan.currency}</span>
              {plan.price.toLocaleString("en-IN")}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{plan.cadence}</div>
            <div className="mt-3 text-xs text-muted-foreground">{plan.billingNote}</div>
            <span
              className={cn(
                "mx-auto mt-4 grid h-6 w-6 place-items-center rounded-full border",
                selected
                  ? "border-transparent bg-gradient-primary"
                  : "border-border bg-transparent",
              )}
            >
              {selected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
