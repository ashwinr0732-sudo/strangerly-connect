import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock, MessageCircle, Shield, Sparkles, VenetianMask } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/common/GlassCard";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "slypp — Meet someone new" },
      {
        name: "description",
        content:
          "Anonymous conversations with people around the world. No account, no profiles, no trace.",
      },
      { property: "og:title", content: "slypp — Meet someone new" },
      {
        property: "og:description",
        content: "Talk to a stranger. Share a moment. Move on.",
      },
    ],
  }),
  component: Landing,
});

const cards = [
  { icon: VenetianMask, title: "Anonymous", copy: "No profiles" },
  { icon: Sparkles, title: "Interests", copy: "Match by interests" },
  { icon: Lock, title: "Private", copy: "Private conversations" },
];

function Landing() {
  const { authStatus } = useAppState();

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-14 text-center sm:px-6 sm:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
          1,248 people online
        </span>

        <h1 className="mx-auto mt-8 max-w-3xl text-5xl font-extrabold leading-[1.05] sm:text-7xl">
          Meet someone <span className="text-gradient">new.</span>
        </h1>
        <p className="mt-6 text-xl text-muted-foreground sm:text-2xl">
          Talk to a stranger. Share a moment. Move on.
        </p>
        <p className="mx-auto mt-5 max-w-md text-sm text-muted-foreground">
          Anonymous conversations with people around the world. No account required.
        </p>

        <PrimaryButton asChild size="lg" className="mt-10 px-10">
          <Link to={authStatus === "authenticated" ? "/interests" : "/auth"}>
            <MessageCircle className="h-5 w-5" />
            Start Chatting
            <ArrowRight className="h-5 w-5" />
          </Link>
        </PrimaryButton>

        <p className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <Shield className="h-4 w-4" /> 100% Anonymous <span>•</span> No Sign up
          <span>•</span> No Trace
        </p>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {cards.map(({ icon: Icon, title, copy }) => (
            <GlassCard key={title} className="p-8">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/15">
                <Icon className="h-7 w-7 text-primary-glow" />
              </span>
              <h2 className="mt-5 text-lg font-bold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <p>Anonymous conversations. Nothing more.</p>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link to="/about" className="hover:text-foreground">
              About
            </Link>
            <Link to="/settings" className="hover:text-foreground">
              Settings
            </Link>
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </AppShell>
  );
}
