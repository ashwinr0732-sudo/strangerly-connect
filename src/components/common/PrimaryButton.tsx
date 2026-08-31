import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const primaryButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-gradient-primary text-primary-foreground glow hover:brightness-110",
        outline: "border border-border bg-surface/50 text-foreground hover:bg-surface-2",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-surface/60",
        danger:
          "border border-destructive/40 text-destructive hover:bg-destructive/10",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-14 px-8 text-base",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

interface Props
  extends ComponentPropsWithoutRef<"button">,
    VariantProps<typeof primaryButtonVariants> {
  asChild?: boolean;
}

export function PrimaryButton({
  className,
  variant,
  size,
  block,
  asChild,
  ...props
}: Props) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(primaryButtonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}

export { primaryButtonVariants };
