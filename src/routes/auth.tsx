import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/common/GlassCard";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SlyppLogo } from "@/components/brand/SlyppLogo";
import { useAppState } from "@/lib/app-state";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Slypp" },
      {
        name: "description",
        content:
          "Sign in securely with Google to start anonymous conversations with strangers on Slypp.",
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
  const { authStatus, signInWithGoogle } = useAppState();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authStatus === "authenticated") navigate({ to: "/interests", replace: true });
  }, [authStatus, navigate]);

  const handleSignIn = async () => {
    if (busy) return;
    setBusy(true);
    const error = await signInWithGoogle();
    if (error) {
      setBusy(false);
      toast.error(error);
    }
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

        <PrimaryButton block className="mt-8" onClick={handleSignIn} disabled={busy}>
          {busy ? "Opening Google…" : "Continue with Google"}
        </PrimaryButton>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          Your Google account is used to securely access Slypp. Your identity is never shown
          to people you chat with.
        </p>
      </GlassCard>
    </AppShell>
  );
}
