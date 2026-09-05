import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/common/GlassCard";
import { PrimaryButton } from "@/components/common/PrimaryButton";

export const Route = createFileRoute("/payment-success")({
  head: () => ({
    meta: [
      { title: "You're Premium — slypp" },
      {
        name: "description",
        content: "Your slypp Premium features are unlocked.",
      },
      { property: "og:title", content: "You're Premium — slypp" },
      { property: "og:description", content: "Premium features unlocked." },
    ],
  }),
  component: PaymentSuccessPage,
});

const UNLOCKED = [
  "View-once images",
  "Voice messages",
  "Priority matching",
  "Region preference",
  "Ad-free experience",
];

function PaymentSuccessPage() {
  return (
    <AppShell className="grid place-items-center px-4 py-12 sm:px-6">
      <GlassCard className="w-full max-w-md p-8 text-center">
        <span className="relative mx-auto grid h-24 w-24 place-items-center rounded-full border-2 border-success">
          <span className="absolute inset-0 rounded-full bg-success/20 blur-2xl animate-pulse-glow" />
          <CheckCircle2 className="relative h-12 w-12 text-success" />
        </span>

        <h1 className="mt-7 text-3xl font-extrabold">You're Premium!</h1>
        <p className="mt-2 text-sm text-muted-foreground">Thank you for upgrading.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your premium features are now unlocked.
        </p>

        <ul className="mt-7 space-y-3 text-left">
          {UNLOCKED.map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-success/20">
                <Check className="h-3 w-3 text-success" />
              </span>
              {item}
            </li>
          ))}
        </ul>

        <PrimaryButton asChild block size="lg" className="mt-8">
          <Link to="/interests">
            Start Chatting <ArrowRight className="h-5 w-5" />
          </Link>
        </PrimaryButton>
        <PrimaryButton asChild block variant="outline" className="mt-3">
          <Link to="/">Back to Home</Link>
        </PrimaryButton>
      </GlassCard>
    </AppShell>
  );
}
