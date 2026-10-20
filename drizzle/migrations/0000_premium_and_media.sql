CREATE TABLE public.premium_entitlements (
  user_id uuid PRIMARY KEY,
  plan text NOT NULL DEFAULT 'month',
  source text NOT NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.premium_entitlements TO authenticated;
GRANT ALL ON public.premium_entitlements TO service_role;
ALTER TABLE public.premium_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY premium_own_select ON public.premium_entitlements FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.is_premium(p_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.premium_entitlements
    WHERE user_id = p_user AND (expires_at IS NULL OR expires_at > now()));
$$;
REVOKE EXECUTE ON FUNCTION public.is_premium(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_premium(uuid) TO authenticated, service_role;

ALTER TABLE public.messages ADD COLUMN media_path text;
ALTER TABLE public.messages ADD COLUMN duration_seconds integer;
ALTER TABLE public.messages ADD COLUMN viewed_at timestamptz;

DROP POLICY IF EXISTS messages_send_as_self ON public.messages;
CREATE POLICY messages_send_as_self ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND is_session_participant(session_id, auth.uid())
  AND is_session_active(session_id)
  AND (type = 'text' OR (type IN ('voice','image') AND public.is_premium(auth.uid())))
);

CREATE OR REPLACE FUNCTION public.validate_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_recent int;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_consents WHERE user_id = NEW.sender_id) THEN
    RAISE EXCEPTION 'Consent required';
  END IF;
  NEW.viewed_at := NULL;
  IF NEW.type = 'text' THEN
    NEW.media_path := NULL;
    NEW.duration_seconds := NULL;
    NEW.content := btrim(NEW.content);
    IF NEW.content = '' THEN RAISE EXCEPTION 'Message cannot be empty'; END IF;
    IF length(NEW.content) > 2000 THEN RAISE EXCEPTION 'Message too long'; END IF;
  ELSIF NEW.type IN ('voice','image') THEN
    IF NOT public.is_premium(NEW.sender_id) THEN RAISE EXCEPTION 'Premium required'; END IF;
    IF NEW.media_path IS NULL OR NEW.media_path NOT LIKE
       (NEW.session_id::text || '/' || NEW.sender_id::text || '/' || NEW.type || '/%') THEN
      RAISE EXCEPTION 'Invalid media';
    END IF;
    IF NEW.type = 'voice' THEN
      NEW.duration_seconds := least(greatest(coalesce(NEW.duration_seconds, 1), 1), 120);
      NEW.content := '[voice message]';
    ELSE
      NEW.duration_seconds := NULL;
      NEW.content := '[view-once image]';
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid message type';
  END IF;
  SELECT count(*) INTO v_recent FROM public.messages
   WHERE sender_id = NEW.sender_id AND created_at > now() - interval '10 seconds';
  IF v_recent >= 15 THEN RAISE EXCEPTION 'Slow down a little'; END IF;
  RETURN NEW;
END; $$;

-- Recipient opens a view-once image exactly once; returns the path only on the first open.
CREATE OR REPLACE FUNCTION public.open_view_once(p_message uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_path text;
BEGIN
  UPDATE public.messages m SET viewed_at = now()
   WHERE m.id = p_message AND m.type = 'image' AND m.viewed_at IS NULL
     AND m.sender_id <> auth.uid()
     AND public.is_session_participant(m.session_id, auth.uid())
  RETURNING m.media_path INTO v_path;
  RETURN v_path;
END; $$;
REVOKE EXECUTE ON FUNCTION public.open_view_once(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.open_view_once(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.can_upload_chat_media(p_name text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE parts text[] := string_to_array(p_name, '/'); v_session uuid;
BEGIN
  IF array_length(parts, 1) <> 4 OR parts[2] <> auth.uid()::text OR parts[3] NOT IN ('voice','image') THEN
    RETURN false;
  END IF;
  BEGIN v_session := parts[1]::uuid; EXCEPTION WHEN others THEN RETURN false; END;
  RETURN public.is_premium(auth.uid())
    AND public.is_session_participant(v_session, auth.uid())
    AND public.is_session_active(v_session);
END; $$;

CREATE OR REPLACE FUNCTION public.can_read_chat_media(p_name text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE parts text[] := string_to_array(p_name, '/'); v_session uuid;
BEGIN
  IF array_length(parts, 1) <> 4 THEN RETURN false; END IF;
  BEGIN v_session := parts[1]::uuid; EXCEPTION WHEN others THEN RETURN false; END;
  IF NOT public.is_session_participant(v_session, auth.uid()) THEN RETURN false; END IF;
  IF parts[3] = 'voice' THEN RETURN true; END IF;
  IF parts[3] = 'image' THEN
    -- only the recipient, only within 60 seconds of their single authorized open
    RETURN EXISTS (SELECT 1 FROM public.messages m
      WHERE m.media_path = p_name AND m.type = 'image' AND m.sender_id <> auth.uid()
        AND m.viewed_at IS NOT NULL AND m.viewed_at > now() - interval '60 seconds');
  END IF;
  RETURN false;
END; $$;

CREATE OR REPLACE FUNCTION public.can_delete_chat_media(p_name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.messages m
    WHERE m.media_path = p_name AND m.type = 'image' AND m.viewed_at IS NOT NULL
      AND public.is_session_participant(m.session_id, auth.uid()));
$$;

REVOKE EXECUTE ON FUNCTION public.can_upload_chat_media(text) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.can_read_chat_media(text) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.can_delete_chat_media(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.can_upload_chat_media(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_read_chat_media(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_delete_chat_media(text) TO authenticated;

CREATE POLICY chat_media_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-media' AND public.can_upload_chat_media(name));
CREATE POLICY chat_media_select ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'chat-media' AND public.can_read_chat_media(name));
CREATE POLICY chat_media_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'chat-media' AND public.can_delete_chat_media(name));