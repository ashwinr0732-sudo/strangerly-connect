import { Link } from "@tanstack/react-router";
import { Menu, Sparkles } from "lucide-react";
import { StrangerlyLogo } from "@/components/brand/StrangerlyLogo";

interface Props {
  onOpenMenu?: () => void;
}

export function Header({ onOpenMenu }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label="strangerly home">
          <StrangerlyLogo size="sm" />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4">
          <Link
            to="/premium"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-primary-glow transition-colors hover:bg-surface/60 sm:inline-flex"
          >
            <Sparkles className="h-4 w-4" /> Premium
          </Link>
          <Link
            to="/about"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            activeProps={{ className: "text-foreground" }}
          >
            About
          </Link>
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface/60 transition-colors hover:bg-surface-2"
          >
            <Menu className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </header>
  );
}
