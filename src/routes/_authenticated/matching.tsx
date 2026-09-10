import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/common/GlassCard";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { MatchingAnimation } from "@/components/matching/MatchingAnimation";
import { MatchStatus } from "@/components/matching/MatchStatus";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/_authenticated/matching")({
  head: () => ({
    meta: [
      { title: "Finding someone — slypp" },
      {
        name: "description",
        content: "slypp is finding an anonymous stranger who shares your interests.",
      },
      { property: "og:title", content: "Finding someone — slypp" },
      {
        property: "og:description",
        content: "Matching you with someone awesome.",
      },
    ],
  }),
  component: MatchingPage,
});

function MatchingPage() {
  const {
    session,
    authStatus,
    matchState,
    hasActiveChat,
    startMatching,
    cancelMatching,
  } = useAppState();
  const navigate = useNavigate();

  // Kick off matchmaking as soon as an anonymous identity exists.
  useEffect(() => {
    if (authStatus === "authenticated" && matchState === "idle" && !hasActiveChat) {
      startMatching();
    }
  }, [authStatus, matchState, hasActiveChat, startMatching]);

  // Matched — go straight into the conversation.
  useEffect(() => {
    if (matchState === "matched" && hasActiveChat) navigate({ to: "/chat" });
  }, [matchState, hasActiveChat, navigate]);

  const interestMode = session.matchingMode === "interests" && session.interests.length > 0;

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

        {authStatus === "error" ? (
          <p className="text-sm text-destructive">
            Something went wrong. Try again.
          </p>
        ) : matchState === "error" ? (
          <p className="text-sm text-destructive">
            Something went wrong. Try again.
          </p>
        ) : matchState === "cancelled" ? (
          <p className="text-sm text-muted-foreground">Search cancelled.</p>
        ) : interestMode ? (
          <MatchStatus interests={session.interests} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Looking for a random stranger.
          </p>
        )}

        <div className="mt-8 space-y-3">
          {(matchState === "error" ||
            matchState === "cancelled" ||
            authStatus === "error") && (
            <PrimaryButton block onClick={startMatching}>
              Try again
            </PrimaryButton>
          )}
          <PrimaryButton
            block
            variant="outline"
            onClick={async () => {
              await cancelMatching();
              navigate({ to: "/interests" });
            }}
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
