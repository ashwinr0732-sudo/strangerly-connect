import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/common/GlassCard";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { PlanSelector } from "@/components/premium/PlanSelector";
import { PREMIUM_FEATURES } from "@/lib/interests";
import { useState } from "react";
import type { PremiumPlanId } from "@/types";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "Go Premium — slypp" },
      {
        name: "description",
        content:
          "Unlock view-once images, voice messages, priority matching and an ad-free experience.",
      },
      { property: "og:title", content: "Go Premium — slypp" },
      {
        property: "og:description",
        content: "Unlock more ways to connect on slypp.",
      },
    ],
  }),
  component: PremiumPage,
});

function PremiumPage() {
  const [plan, setPlan] = useState<PremiumPlanId>("month");
  const navigate = useNavigate();

  return (
    <AppShell className="px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <GlassCard className="p-7 sm:p-9">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary-glow" /> Upgrade to Premium
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight">
            Unlock more ways
            <br />
            <span className="text-gradient">to connect.</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Level up your conversations with powerful premium features.
          </p>

          <ul className="mt-8 space-y-5">
            {PREMIUM_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.key} className="flex gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-primary/10">
                    <Icon className="h-4.5 w-4.5 text-primary-glow" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{f.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {f.description}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
            <ShieldCheck className="h-6 w-6 text-primary-glow" />
            <span>
              <span className="block text-sm font-semibold text-primary-glow">
                100% Anonymous
              </span>
              <span className="block text-xs text-muted-foreground">
                No personal data required.
              </span>
            </span>
          </div>
        </GlassCard>

        <GlassCard className="p-7 sm:p-9">
          <h2 className="text-lg font-semibold">Choose your plan</h2>
          <div className="mt-8">
            <PlanSelector value={plan} onChange={setPlan} />
          </div>
          <PrimaryButton
            block
            size="lg"
            className="mt-8"
            onClick={() => navigate({ to: "/payment", search: { plan } })}
          >
            Upgrade now
          </PrimaryButton>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Cancel anytime. Instant access after payment.
          </p>
        </GlassCard>
      </div>
    </AppShell>
  );
}
