CREATE TABLE public.user_consents (
  user_id uuid PRIMARY KEY,
  age_confirmed boolean NOT NULL,
  terms_accepted boolean NOT NULL,
  privacy_accepted boolean NOT NULL,
  terms_version text NOT NULL,
  privacy_version text NOT NULL,
  consented_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT consent_all_true CHECK (age_confirmed AND terms_accepted AND privacy_accepted)
);
GRANT SELECT, INSERT, UPDATE ON public.user_consents TO authenticated;
GRANT ALL ON public.user_consents TO service_role;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY consent_own_select ON public.user_consents FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY consent_own_insert ON public.user_consents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY consent_own_update ON public.user_consents FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.consent_set_timestamps()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.consented_at := now();
  NEW.updated_at := now();
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_consent_ts BEFORE INSERT OR UPDATE ON public.user_consents
FOR EACH ROW EXECUTE FUNCTION public.consent_set_timestamps();

CREATE OR REPLACE FUNCTION public.has_current_consent(p_terms text, p_privacy text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_consents
    WHERE user_id = auth.uid() AND terms_version = p_terms AND privacy_version = p_privacy);
$$;
REVOKE EXECUTE ON FUNCTION public.has_current_consent(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_current_consent(text, text) TO authenticated;

-- Matchmaking requires a consent record
CREATE OR REPLACE FUNCTION public.require_consent_queue()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_consents WHERE user_id = NEW.user_id) THEN
    RAISE EXCEPTION 'Consent required';
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.require_consent_queue() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_queue_requires_consent BEFORE INSERT ON public.chat_queue
FOR EACH ROW EXECUTE FUNCTION public.require_consent_queue();

-- Shared interests recorded on the session (no identities, just overlapping tags)
ALTER TABLE public.chat_sessions ADD COLUMN shared_interests text[] NOT NULL DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.set_session_shared_interests()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a text[]; b text[];
BEGIN
  SELECT interests INTO a FROM public.chat_queue WHERE user_id = NEW.user_a;
  SELECT interests INTO b FROM public.chat_queue WHERE user_id = NEW.user_b;
  NEW.shared_interests := coalesce(ARRAY(SELECT unnest(coalesce(a,'{}')) INTERSECT SELECT unnest(coalesce(b,'{}'))), '{}');
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.set_session_shared_interests() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_session_shared_interests BEFORE INSERT ON public.chat_sessions
FOR EACH ROW EXECUTE FUNCTION public.set_session_shared_interests();

-- Messages: sender must have consent (in addition to existing participant/active checks)
CREATE OR REPLACE FUNCTION public.validate_message()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_recent int;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_consents WHERE user_id = NEW.sender_id) THEN
    RAISE EXCEPTION 'Consent required';
  END IF;
  NEW.content := btrim(NEW.content);
  IF NEW.content = '' THEN
    RAISE EXCEPTION 'Message cannot be empty';
  END IF;
  IF length(NEW.content) > 2000 THEN
    RAISE EXCEPTION 'Message too long';
  END IF;
  SELECT count(*) INTO v_recent FROM public.messages
   WHERE sender_id = NEW.sender_id AND created_at > now() - interval '10 seconds';
  IF v_recent >= 15 THEN
    RAISE EXCEPTION 'Slow down a little';
  END IF;
  RETURN NEW;
END;
$function$;