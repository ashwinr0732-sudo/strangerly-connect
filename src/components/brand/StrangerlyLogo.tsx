import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
}

const sizes = {
  sm: { box: "h-8 w-8", text: "text-lg" },
  md: { box: "h-10 w-10", text: "text-xl" },
  lg: { box: "h-14 w-14", text: "text-3xl" },
};

/** slypp mascot mark + wordmark. */
export function SlyppLogo({ className, size = "md", showWordmark = true }: Props) {
  const s = sizes[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative grid place-items-center rounded-2xl bg-gradient-primary glow",
          s.box,
        )}
      >
        <svg viewBox="0 0 32 32" className="h-2/3 w-2/3" aria-hidden="true">
          <path
            d="M16 4c-6 0-10 4.2-10 10v13.2c0 .9 1 1.4 1.7.9l2.6-2 2.6 2c.4.3 1 .3 1.4 0l2.6-2 2.6 2c.4.3 1 .3 1.4 0l2.6-2 2.6 2c.7.5 1.7 0 1.7-.9V14c0-5.8-4-10-10-10z"
            fill="currentColor"
            className="text-primary-foreground"
          />
          <circle cx="12" cy="14" r="2.3" className="fill-primary" />
          <circle cx="20" cy="14" r="2.3" className="fill-primary" />
        </svg>
      </span>
      {showWordmark && (
        <span className={cn("font-extrabold tracking-tight", s.text)}>
          <span className="text-wordmark-base">Sly</span>
          <span className="text-wordmark-accent wordmark-glow">pp</span>
        </span>
      )}
    </span>
  );
}
