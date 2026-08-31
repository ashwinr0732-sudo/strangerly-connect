import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/common/GlassCard";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { MatchingAnimation } from "@/components/matching/MatchingAnimation";
import { MatchStatus } from "@/components/matching/MatchStatus";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/matching")({
  head: () => ({
    meta: [
      { title: "Finding someone — strangerly" },
      {
        name: "description",
        content: "strangerly is finding an anonymous stranger who shares your interests.",
      },
      { property: "og:title", content: "Finding someone — strangerly" },
      {
        property: "og:description",
        content: "Matching you with someone awesome.",
      },
    ],
  }),
  component: MatchingPage,
});

function MatchingPage() {
  const { session, startChat } = useAppState();
  const navigate = useNavigate();

  return (
    <AppShell className="grid place-items-center px-4 py-10 sm:px-6">
      <GlassCard className="w-full max-w-md p-8 text-center">
        <h1 className="text-3xl font-extrabold leading-tight">
          Finding someone
          <br />
          <span className="text-gradient">awesome</span> for you...
        </h1>

        <div className="my-8">
          <MatchingAnimation />
        </div>

        <MatchStatus interests={session.interests} />

        <div className="mt-8 space-y-3">
          {/* Temporary development entry point until real matchmaking exists. */}
          <PrimaryButton
            block
            onClick={() => {
              startChat();
              navigate({ to: "/chat" });
            }}
          >
            Enter chat (dev)
          </PrimaryButton>
          <PrimaryButton
            block
            variant="outline"
            onClick={() => navigate({ to: "/interests" })}
          >
            Cancel
          </PrimaryButton>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Tip: Adding more interests increases your chances of finding a great match!
        </p>
      </GlassCard>
    </AppShell>
  );
}
