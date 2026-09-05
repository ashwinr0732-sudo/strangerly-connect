import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChevronRight, Crown, Globe, Languages, Shield, Sparkles, Users, Volume2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/common/GlassCard";
import { PremiumFeatureLock } from "@/components/premium/PremiumFeatureLock";
import { Switch } from "@/components/ui/switch";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — slypp" },
      {
        name: "description",
        content: "Manage your slypp preferences, interests and premium status.",
      },
      { property: "og:title", content: "Settings — slypp" },
      { property: "og:description", content: "Your slypp preferences." },
    ],
  }),
  component: SettingsPage,
});

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Bell;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-4 last:border-0">
      <Icon className="h-4.5 w-4.5 text-muted-foreground" />
      <span className="text-sm font-medium">{label}</span>
      <span className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
        {children}
      </span>
    </div>
  );
}

function SettingsPage() {
  const { session, updatePreferences } = useAppState();

  return (
    <AppShell className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-extrabold">Settings</h1>

        <GlassCard>
          <p className="px-4 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Account
          </p>
          <Row icon={Crown} label="Premium status">
            {session.isPremium ? (
              <span className="rounded-md bg-gradient-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                Premium
              </span>
            ) : (
              <Link to="/premium" className="text-primary-glow hover:underline">
                Upgrade
              </Link>
            )}
          </Row>
          <Row icon={Shield} label="Anonymous session">
            <span className="max-w-[10rem] truncate text-xs">{session.id}</span>
          </Row>
        </GlassCard>

        <GlassCard>
          <p className="px-4 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Preferences
          </p>
          <Row icon={Sparkles} label="Interests">
            <Link to="/interests" className="flex items-center gap-1 hover:text-foreground">
              Edit <ChevronRight className="h-4 w-4" />
            </Link>
          </Row>
          <Row icon={Globe} label="Region preference">
            <PremiumFeatureLock label="Region preference">
              <select
                value={session.preferences.region}
                onChange={(e) => updatePreferences({ region: e.target.value })}
                className="rounded-lg border border-border bg-surface/60 px-2 py-1 text-sm"
              >
                {["Worldwide", "India", "Europe", "North America"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </PremiumFeatureLock>
          </Row>
          <Row icon={Languages} label="Match language">
            <select
              value={session.preferences.matchLanguage}
              onChange={(e) => updatePreferences({ matchLanguage: e.target.value })}
              className="rounded-lg border border-border bg-surface/60 px-2 py-1 text-sm"
            >
              {["English", "Hindi", "Spanish"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </Row>
          <Row icon={Users} label="Show me">
            <select
              value={session.preferences.showMe}
              onChange={(e) => updatePreferences({ showMe: e.target.value })}
              className="rounded-lg border border-border bg-surface/60 px-2 py-1 text-sm"
            >
              {["Everyone", "Similar interests"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Row>
        </GlassCard>

        <GlassCard>
          <p className="px-4 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            General
          </p>
          <Row icon={Bell} label="Notifications">
            <Switch
              checked={session.preferences.notifications}
              onCheckedChange={(notifications) => updatePreferences({ notifications })}
            />
          </Row>
          <Row icon={Volume2} label="Sound">
            <Switch
              checked={session.preferences.sound}
              onCheckedChange={(sound) => updatePreferences({ sound })}
            />
          </Row>
          <Row icon={Shield} label="Privacy & safety">
            <Link to="/privacy" className="flex items-center gap-1 hover:text-foreground">
              Read <ChevronRight className="h-4 w-4" />
            </Link>
          </Row>
        </GlassCard>
      </div>
    </AppShell>
  );
}
