import { useState, type ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  /** Hide the marketing header (used by the full-viewport chat shell). */
  bare?: boolean;
  className?: string;
}

export function AppShell({ children, bare, className }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-dvh bg-background">
      <div className="pointer-events-none fixed inset-0 bg-space" aria-hidden="true" />
      <div className="relative flex min-h-dvh flex-col">
        {!bare && <Header onOpenMenu={() => setMenuOpen(true)} />}
        <main className={cn("flex-1", className)}>{children}</main>
      </div>
      <MobileNavigation open={menuOpen} onOpenChange={setMenuOpen} />
    </div>
  );
}
