import { Link, useNavigate } from "@tanstack/react-router";
import { Globe, Info, LogOut, MessageCircle, Sparkles } from "lucide-react";
import { SlyppLogo } from "@/components/brand/SlyppLogo";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

const links = [
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/interests", label: "Interests", icon: Sparkles },
  { to: "/about", label: "About", icon: Info },
] as const;

export function Sidebar({ className }: { className?: string }) {
  const { session, endChat } = useAppState();
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        "flex w-72 shrink-0 flex-col border-r border-border bg-sidebar p-5",
        className,
      )}
    >
      <Link to="/" aria-label="slypp home">
        <SlyppLogo size="sm" />
      </Link>

      <Link
        to="/premium"
        className="mt-8 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 transition-colors hover:bg-primary/15"
      >
        <Sparkles className="h-5 w-5 text-primary-glow" />
        <span>
          <span className="block text-sm font-semibold">Premium</span>
          <span className="block text-xs text-muted-foreground">
            {session.isPremium ? "Active — thanks!" : "Unlock more ways to connect"}
          </span>
        </span>
      </Link>

      <nav className="mt-6 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            activeProps={{ className: "bg-sidebar-accent text-foreground" }}
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-2xl border border-border bg-surface/50 p-4">
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="font-medium">1,248 people online</span>
          </div>
          <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
            {session.preferences.region}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            endChat();
            navigate({ to: "/" });
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" /> End Chat
        </button>
      </div>
    </aside>
  );
}
