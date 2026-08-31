import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/common/GlassCard";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — strangerly" },
      {
        name: "description",
        content:
          "strangerly does not collect personal information and conversations are not stored.",
      },
      { property: "og:title", content: "Privacy Policy — strangerly" },
      { property: "og:description", content: "Your privacy is our priority." },
    ],
  }),
  component: PrivacyPage,
});

const POINTS = [
  "We do not collect personal information.",
  "Your conversations are not stored.",
  "Images and voice messages are ephemeral.",
  "You remain 100% anonymous.",
  "No account, no email, no phone number required.",
];

function PrivacyPage() {
  return (
    <AppShell className="px-4 py-12 sm:px-6">
      <GlassCard className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-extrabold">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Your privacy is our priority.</p>
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
