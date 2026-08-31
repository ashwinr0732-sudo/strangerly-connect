import { cn } from "@/lib/utils";

interface Props {
  online?: boolean;
  label?: string;
  className?: string;
}

export function StatusIndicator({ online = true, label, className }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          online ? "bg-success animate-pulse-glow" : "bg-muted-foreground",
        )}
      />
      {label && <span className="text-muted-foreground">{label}</span>}
    </span>
  );
}
