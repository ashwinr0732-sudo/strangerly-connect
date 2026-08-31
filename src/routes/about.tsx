import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/common/GlassCard";
import { StrangerlyLogo } from "@/components/brand/StrangerlyLogo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About strangerly" },
      {
        name: "description",
        content:
          "strangerly is a place to meet new people from around the world and have real, anonymous conversations.",
      },
      { property: "og:title", content: "About strangerly" },
      {
        property: "og:description",
        content: "No profiles. No pressure. Just you and someone new.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <AppShell className="grid place-items-center px-4 py-12 sm:px-6">
      <GlassCard className="w-full max-w-md p-8 text-center">
        <StrangerlyLogo size="lg" showWordmark={false} className="mx-auto" />
        <h1 className="mt-6 text-2xl font-extrabold">About strangerly</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          strangerly is a place to meet new people from around the world and have real,
          anonymous conversations.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          No profiles. No pressure. Just you and someone new.
        </p>
        <p className="mt-8 text-xs text-muted-foreground">Made with 💜 for real connections.</p>
        <div className="mt-6 flex justify-center gap-5 text-sm">
          <Link to="/privacy" className="text-primary-glow hover:underline">
            Privacy
          </Link>
          <Link to="/terms" className="text-primary-glow hover:underline">
            Terms
          </Link>
        </div>
      </GlassCard>
    </AppShell>
  );
}
