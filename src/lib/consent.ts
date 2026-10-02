import { supabase } from "@/integrations/supabase/client";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal";

// The consent table is newer than the generated types; use an untyped handle.
const db = supabase as unknown as {
  from: (t: string) => any;
  rpc: (fn: string, args?: Record<string, unknown>) => any;
};

/** True only when the backend holds a consent record for the current versions. */
export async function hasCurrentConsent(): Promise<boolean> {
  const { data, error } = await db.rpc("has_current_consent", {
    p_terms: TERMS_VERSION,
    p_privacy: PRIVACY_VERSION,
  });
  if (error) return false;
  return data === true;
}

/** Stores the 18+ / Terms / Privacy consent against the signed-in account. */
export async function recordConsent(userId: string): Promise<string | null> {
  const { error } = await db.from("user_consents").upsert(
    {
      user_id: userId,
      age_confirmed: true,
      terms_accepted: true,
      privacy_accepted: true,
      terms_version: TERMS_VERSION,
      privacy_version: PRIVACY_VERSION,
    },
    { onConflict: "user_id" },
  );
  return error ? "Couldn't save your consent. Please try again." : null;
}
