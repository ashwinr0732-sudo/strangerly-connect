import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CornerDownLeft, Shuffle, X } from "lucide-react";
import { useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/common/GlassCard";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { InterestSelector } from "@/components/matching/InterestSelector";
import { useAppState } from "@/lib/app-state";
import { MAX_INTERESTS, normalizeInterestInput } from "@/lib/interests";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/interests")({
  head: () => ({
    meta: [
      { title: "What are you into? — strangerly" },
      {
        name: "description",
        content:
          "Pick up to five interests — or add your own hashtags — so strangerly can match you with someone you'll vibe with.",
      },
      { property: "og:title", content: "What are you into? — strangerly" },
      {
        property: "og:description",
        content: "Choose something you love talking about. Interests are free for everyone.",
      },
    ],
  }),
  component: InterestsPage,
});

function InterestsPage() {
  const { session, toggleInterest, addInterest, removeInterest, setMatchingMode } =
    useAppState();
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const interests = session.interests;
  const count = interests.length;
  const atMax = count >= MAX_INTERESTS;

  const commitDraft = () => {
    const id = normalizeInterestInput(draft);
    if (!id) return;
    addInterest(id);
    setDraft("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && draft === "" && interests.length > 0) {
      e.preventDefault();
      removeInterest(interests[interests.length - 1]!);
    }
  };

  const startMatching = () => {
    setMatchingMode(count > 0 ? "interests" : "random");
    navigate({ to: "/matching" });
  };

  const skipRandom = () => {
    setMatchingMode("random");
    navigate({ to: "/matching" });
  };

  return (
    <AppShell className="grid place-items-center px-4 py-10 sm:px-6">
      <GlassCard className="w-full max-w-xl p-6 sm:p-9">
        <h1 className="text-center text-3xl font-extrabold leading-tight">
          What are you
          <br />
          <span className="text-gradient">into?</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-center text-sm text-muted-foreground">
          Choose something you love talking about.
          <br />
          <span className="text-muted-foreground/70">
            Pick from the suggestions or add your own.
          </span>
        </p>

        <div className="mt-8">
          <InterestSelector
            selected={interests}
            disabled={atMax}
            onToggle={toggleInterest}
          />
        </div>

        {/* Custom interest chatbox */}
        <div className="mt-6">
          <div
            className={cn(
              "flex min-h-[3.25rem] flex-wrap items-center gap-2 rounded-2xl border bg-surface/60 px-3.5 py-2.5 transition-all focus-within:border-primary/60 focus-within:glow",
              atMax ? "border-border/50 opacity-80" : "border-border",
            )}
            onClick={() => inputRef.current?.focus()}
          >
            {interests.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-glow"
              >
                #{id}
                <button
                  type="button"
                  aria-label={`Remove #${id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeInterest(id);
                  }}
                  className="grid h-3.5 w-3.5 place-items-center rounded-full transition-colors hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              value={draft}
              disabled={atMax}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={count === 0 ? "Type your own interest..." : ""}
              className="min-w-[8rem] flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              aria-label="Add interest"
              disabled={atMax || normalizeInterestInput(draft) === ""}
              onClick={commitDraft}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-primary text-primary-foreground transition-opacity disabled:opacity-30"
            >
              <CornerDownLeft className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {count} / {MAX_INTERESTS} selected
            </span>
            {atMax && <span className="text-primary-glow">Maximum 5 interests</span>}
          </div>
        </div>

        <button
          type="button"
          onClick={skipRandom}
          className="mx-auto mt-7 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Shuffle className="h-4 w-4" />
          Skip — Match me randomly
        </button>

        <PrimaryButton block size="lg" className="mt-4" onClick={startMatching}>
          Start Matching <ArrowRight className="h-5 w-5" />
        </PrimaryButton>

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
