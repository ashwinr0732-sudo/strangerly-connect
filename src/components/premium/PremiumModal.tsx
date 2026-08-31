import { useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Sparkles } from "lucide-react";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppState } from "@/lib/app-state";
import { PREMIUM_FEATURES } from "@/lib/interests";

export function PremiumModal() {
  const { premiumModalOpen, setPremiumModalOpen } = useAppState();
  const navigate = useNavigate();

  return (
    <Dialog open={premiumModalOpen} onOpenChange={setPremiumModalOpen}>
      <DialogContent className="glass-card max-h-[90dvh] max-w-lg overflow-y-auto rounded-3xl border-border p-6 sm:p-8">
        <DialogTitle className="sr-only">Upgrade to Premium</DialogTitle>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5 text-primary-glow" /> Upgrade to Premium
        </span>
        <h2 className="mt-4 text-3xl font-extrabold leading-tight">
          Unlock more ways
          <br />
          <span className="text-gradient">to connect.</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Level up your conversations with powerful premium features.
        </p>

        <ul className="mt-6 space-y-4">
          {PREMIUM_FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <li key={f.key} className="flex gap-3">
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

        <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
          <ShieldCheck className="h-5 w-5 text-primary-glow" />
          <span>
            <span className="block text-sm font-semibold text-primary-glow">
              100% Anonymous
            </span>
            <span className="block text-xs text-muted-foreground">
              No personal data required.
            </span>
          </span>
        </div>

        <PrimaryButton
          block
          size="lg"
          className="mt-6"
          onClick={() => {
            setPremiumModalOpen(false);
            navigate({ to: "/premium" });
          }}
        >
          See Plans
        </PrimaryButton>
      </DialogContent>
    </Dialog>
  );
}
