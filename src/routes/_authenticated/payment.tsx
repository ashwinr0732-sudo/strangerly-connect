import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Clock, CreditCard, Lock, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/common/GlassCard";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { PlanSelector } from "@/components/premium/PlanSelector";
import { PREMIUM_PLANS } from "@/lib/interests";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";
import type { PremiumPlanId } from "@/types";

const PLAN_IDS: PremiumPlanId[] = ["week", "month", "year"];

export const Route = createFileRoute("/_authenticated/payment")({
  validateSearch: (search: Record<string, unknown>) => ({
    plan: PLAN_IDS.includes(search['plan'] as PremiumPlanId)
      ? (search['plan'] as PremiumPlanId)
      : ("month" as PremiumPlanId),
  }),
  head: () => ({
    meta: [
      { title: "Checkout — slypp Premium" },
      {
        name: "description",
        content: "Complete your slypp Premium upgrade with a secure payment.",
      },
      { property: "og:title", content: "Checkout — slypp Premium" },
      { property: "og:description", content: "Secure premium checkout." },
    ],
  }),
  component: PaymentPage,
});

const METHODS = [
  { id: "upi", label: "UPI" },
  { id: "card", label: "Card" },
  { id: "paytm", label: "Paytm" },
  { id: "gpay", label: "Google Pay" },
  { id: "phonepe", label: "PhonePe" },
];

const TRUST = [
  {
    icon: ShieldCheck,
    title: "Secure & Encrypted",
    copy: "Your payments are secure and protected.",
  },
  { icon: Clock, title: "Cancel Anytime", copy: "Cancel your subscription anytime." },
  { icon: Zap, title: "Instant Access", copy: "Get premium features immediately." },
];

function PaymentPage() {
  const { plan: initialPlan } = Route.useSearch();
  const [plan, setPlan] = useState<PremiumPlanId>(initialPlan);
  const [method, setMethod] = useState("upi");
  const [upi, setUpi] = useState("");
  const { setPremium } = useAppState();
  const navigate = useNavigate();

  const selected = PREMIUM_PLANS.find((p) => p.id === plan)!;

  const pay = () => {
    // Mock payment only — real processing comes later.
    setPremium(true);
    navigate({ to: "/payment-success" });
  };

  return (
    <AppShell className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <GlassCard className="p-6 sm:p-9">
          <h1 className="text-lg font-semibold">Choose your plan</h1>
          <div className="mt-8">
            <PlanSelector value={plan} onChange={setPlan} />
          </div>

          <p className="mt-9 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" /> Secure payment
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-3 py-3.5 text-sm font-medium transition-all",
                  method === m.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface/50 hover:border-primary/40",
                )}
              >
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                {m.label}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-surface/50 p-5">
            <p className="text-sm font-semibold">
              {method === "upi" ? "Pay with any UPI app" : "Pay securely"}
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={upi}
                onChange={(e) => setUpi(e.target.value)}
                placeholder={method === "upi" ? "yourname@upi" : "Card number"}
                className="h-12 flex-1 rounded-xl border border-border bg-background/50 px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
              />
              <PrimaryButton size="lg" className="sm:w-48" onClick={pay}>
                Pay {selected.currency}
                {selected.price.toLocaleString("en-IN")}
                <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              You will be redirected to complete the payment.
            </p>
          </div>

          <div className="mt-8 grid gap-5 border-t border-border pt-6 sm:grid-cols-3">
            {TRUST.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="flex gap-3">
                <Icon className="h-5 w-5 shrink-0 text-primary-glow" />
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="block text-xs text-muted-foreground">{copy}</span>
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
