import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { hasCurrentConsent } from "@/lib/consent";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    // Reject missing sessions AND legacy anonymous sessions — only a real
    // Google-authenticated account may enter the protected app.
    if (error || !data.user || data.user.is_anonymous) {
      throw redirect({ to: "/auth" });
    }
    // Require a backend consent record (18+, Terms, Privacy) for current versions.
    if (!(await hasCurrentConsent())) {
      throw redirect({ to: "/auth" });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
