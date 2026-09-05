import { Link } from "@tanstack/react-router";
import {
  Crown,
  House,
  Info,
  MessageCircle,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { SlyppLogo } from "@/components/brand/SlyppLogo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export const NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Home", icon: House },
  { to: "/interests", label: "Interests", icon: Sparkles },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/premium", label: "Premium", icon: Crown },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/about", label: "About", icon: Info },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNavigation({ open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-72 border-border bg-sidebar p-6">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SlyppLogo size="sm" />
        <nav className="mt-8 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
              activeProps={{ className: "bg-sidebar-accent text-foreground" }}
              activeOptions={{ exact: to === "/" }}
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
