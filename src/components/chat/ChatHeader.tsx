import { ChevronLeft, Menu, SkipForward } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { StatusIndicator } from "@/components/common/StatusIndicator";
import { useAppState } from "@/lib/app-state";

interface Props {
  onNext: () => void;
  onOpenMenu: () => void;
}

export function ChatHeader({ onNext, onOpenMenu }: Props) {
  const { chat } = useAppState();

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/70 px-3 backdrop-blur-xl sm:px-5">
      <Link
        to="/interests"
        aria-label="Back"
        className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-surface/60 hover:text-foreground lg:hidden"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>

      <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
        :)
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{chat.strangerAlias}</p>
        <StatusIndicator
          online={chat.strangerOnline}
          label={chat.strangerOnline ? "Online" : "Offline"}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
        >
          Next <SkipForward className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface/60 lg:hidden"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
      </div>
    </header>
  );
}
