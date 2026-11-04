import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * TEMPORARY BETA ACTIVATION — remove when real payments are integrated.
 *
 * Grants Premium directly from the server (service role), never from the
 * browser, so the entitlement is a real backend row that survives refresh,
 * re-login and other devices. Nothing is charged and no payment transaction
 * is created.
 *
 * Every beta entitlement row is written with source = 'beta-launch', so
 * switching to real payments later means: delete this file, remove the
 * button call in the payment page, and delete the rows
 * (delete from premium_entitlements where source = 'beta-launch').
 */
export const activateBetaPremium = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("premium_entitlements").upsert(
      {
        user_id: context.userId,
        plan: "beta",
        source: "beta-launch",
        expires_at: null,
      },
      { onConflict: "user_id" },
    );
    if (error) {
      console.error("[slypp] beta premium activation failed:", error.message);
      return { ok: false, error: "Couldn't activate Premium. Please try again." };
    }
    return { ok: true, error: null };
  });
