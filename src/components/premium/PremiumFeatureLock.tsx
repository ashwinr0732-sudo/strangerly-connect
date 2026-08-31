import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  /** Rendered as-is when the user already has premium. */
  className?: string;
  label?: string;
}

/**
 * Wraps a premium-only control. Free users still see the control with a small
 * lock badge; clicking it opens the premium upgrade modal instead of acting.
 */
export function PremiumFeatureLock({ children, className, label }: Props) {
  const { session, openPremiumModal } = useAppState();

  if (session.isPremium) return <>{children}</>;

  return (
    <span className={cn("relative inline-flex", className)}>
      <span className="pointer-events-none opacity-70">{children}</span>
      <button
        type="button"
        aria-label={label ? `${label} — premium feature` : "Premium feature"}
        onClick={openPremiumModal}
        className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <span className="pointer-events-none absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-gradient-primary">
        <Lock className="h-2.5 w-2.5 text-primary-foreground" />
      </span>
    </span>
  );
}
