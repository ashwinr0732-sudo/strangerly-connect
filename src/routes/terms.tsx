import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/common/GlassCard";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — slypp" },
      {
        name: "description",
        content: "The rules for using slypp anonymous chat.",
      },
      { property: "og:title", content: "Terms of Service — slypp" },
      { property: "og:description", content: "By using slypp, you agree to these terms." },
    ],
  }),
  component: TermsPage,
});

const POINTS = [
  "Be respectful and kind to others.",
  "Do not engage in illegal or harmful activities.",
  "Do not send spam or inappropriate content.",
  "We reserve the right to suspend misuse.",
  "You must be of legal age to use slypp.",
];

function TermsPage() {
  return (
    <AppShell className="px-4 py-12 sm:px-6">
      <GlassCard className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-extrabold">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          By using slypp, you agree to:
        </p>
        <ul className="mt-6 space-y-3">
          {POINTS.map((p) => (
            <li key={p} className="flex gap-3 text-sm text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-glow" />
              {p}
            </li>
          ))}
        </ul>
      </GlassCard>
    </AppShell>
  );
}
