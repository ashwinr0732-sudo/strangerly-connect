import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends ComponentPropsWithoutRef<"div"> {
  glow?: boolean;
}

export function GlassCard({ className, glow: withGlow, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl transition-colors",
        withGlow && "glow",
        className,
      )}
      {...props}
    />
  );
}
