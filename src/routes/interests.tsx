import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/common/GlassCard";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { InterestSelector } from "@/components/matching/InterestSelector";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/interests")({
  head: () => ({
    meta: [
      { title: "Pick your interests — strangerly" },
      {
        name: "description",
        content: "Choose a few interests so strangerly can find someone you'll vibe with.",
      },
      { property: "og:title", content: "Pick your interests — strangerly" },
      {
        property: "og:description",
        content: "Interests are free for everyone on strangerly.",
      },
    ],
  }),
  component: InterestsPage,
});

function InterestsPage() {
  const { session, toggleInterest, clearInterests } = useAppState();
  const navigate = useNavigate();

  return (
    <AppShell className="grid place-items-center px-4 py-10 sm:px-6">
      <GlassCard className="w-full max-w-xl p-6 sm:p-9">
        <h1 className="text-center text-3xl font-extrabold leading-tight">
          What are you
          <br />
          <span className="text-gradient">into?</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-center text-sm text-muted-foreground">
          Pick a few interests to help us find someone you'll vibe with.
        </p>

        <div className="mt-8">
          <InterestSelector selected={session.interests} onToggle={toggleInterest} />
        </div>

        <PrimaryButton
          block
          size="lg"
          className="mt-8"
          onClick={() => navigate({ to: "/matching" })}
        >
          Start Matching <ArrowRight className="h-5 w-5" />
        </PrimaryButton>

        <button
          type="button"
          onClick={() => {
            clearInterests();
            navigate({ to: "/matching" });
          }}
          className="mx-auto mt-4 block text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Skip — Match me randomly
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Interests are free for everyone.{" "}
          <Link to="/premium" className="text-primary-glow hover:underline">
            See premium features
          </Link>
        </p>
      </GlassCard>
    </AppShell>
  );
}
