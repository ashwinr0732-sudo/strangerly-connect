import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/common/GlassCard";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SlyppLogo } from "@/components/brand/SlyppLogo";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppState } from "@/lib/app-state";
import { hasCurrentConsent, recordConsent } from "@/lib/consent";
import { PENDING_CONSENT_KEY } from "@/lib/legal";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Slypp" },
      {
        name: "description",
        content:
          "Sign in securely with Google to start anonymous 18+ conversations with strangers on Slypp.",
      },
      { property: "og:title", content: "Sign in — Slypp" },
      {
        property: "og:description",
        content: "Your account stays private. Your chats stay anonymous.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { authStatus, userId, signInWithGoogle } = useAppState();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [needsConsent, setNeedsConsent] = useState(false);
  const handled = useRef<string | null>(null);

  // After sign-in: store consent in the backend, or ask for it if missing.
  useEffect(() => {
    if (authStatus !== "authenticated" || !userId || handled.current === userId) return;
    handled.current = userId;
    (async () => {
      let pending = false;
      try {
        pending = window.sessionStorage.getItem(PENDING_CONSENT_KEY) === "1";
        window.sessionStorage.removeItem(PENDING_CONSENT_KEY);
      } catch {
        /* ignore */
      }
      if (pending) {
        const err = await recordConsent(userId);
        if (err) toast.error(err);
      }
      if (await hasCurrentConsent()) {
        navigate({ to: "/interests", replace: true });
      } else {
        setBusy(false);
        setNeedsConsent(true);
      }
    })();
  }, [authStatus, userId, navigate]);

  const handleSignIn = async () => {
    if (busy) return;
    if (!agreed) {
      toast.error("Please confirm you are 18+ and accept the Terms and Privacy Policy.");
      return;
    }
    setBusy(true);
    try {
      window.sessionStorage.setItem(PENDING_CONSENT_KEY, "1");
    } catch {
      /* ignore */
    }
    const error = await signInWithGoogle();
    if (error) {
      setBusy(false);
      toast.error(error);
    }
  };

  const handleConfirm = async () => {
    if (busy || !userId) return;
    if (!agreed) {
      toast.error("Please confirm you are 18+ and accept the Terms and Privacy Policy.");
      return;
    }
    setBusy(true);
    const err = await recordConsent(userId);
    if (err || !(await hasCurrentConsent())) {
      setBusy(false);
      toast.error(err ?? "Couldn't save your consent. Please try again.");
      return;
    }
    navigate({ to: "/interests", replace: true });
  };

  return (
    <AppShell className="grid place-items-center px-4 py-16">
      <GlassCard className="w-full max-w-md p-8 text-center">
        <div className="flex justify-center">
          <SlyppLogo size="sm" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold">Welcome to Slypp</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account stays private. Your chats stay anonymous.
        </p>

        <div className="mt-6 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-left text-xs text-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>Slypp is an 18+ anonymous chat service. Users under 18 are not permitted.</span>
        </div>

        <label
          htmlFor="consent"
          className="mt-5 flex cursor-pointer items-start gap-3 text-left text-sm text-muted-foreground"
        >
          <Checkbox
            id="consent"
            checked={agreed}
            onCheckedChange={(v) => setAgreed(v === true)}
            className="mt-0.5"
            aria-label="I confirm I am 18 or older and agree to the Terms and Privacy Policy"
          />
          <span>
            I confirm that I am 18 years or older, and I agree to the{" "}
            <Link to="/terms" target="_blank" className="text-primary-glow hover:underline">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link to="/privacy" target="_blank" className="text-primary-glow hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {needsConsent ? (
          <PrimaryButton block className="mt-6" onClick={handleConfirm} disabled={busy || !agreed}>
            {busy ? "Saving…" : "Confirm and continue"}
          </PrimaryButton>
        ) : (
          <PrimaryButton block className="mt-6" onClick={handleSignIn} disabled={busy || !agreed}>
            {busy ? "Opening Google…" : "Continue with Google"}
          </PrimaryButton>
        )}

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          Your Google account is used to securely access Slypp. Your identity is never shown
          to people you chat with.
        </p>
      </GlassCard>
    </AppShell>
  );
}
