-- View-once voice messages: mark voice messages that can only be opened once,
-- mirroring how view-once images already work.
ALTER TABLE public.messages
  ADD COLUMN is_view_once boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.messages.is_view_once IS 'True for view-once media: images are always view-once, voice only when sent as view-once';

-- Sender-side validation: text is never view-once, images always are, voice only when flagged.
CREATE OR REPLACE FUNCTION public.validate_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_recent int;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_consents WHERE user_id = NEW.sender_id) THEN
    RAISE EXCEPTION 'Consent required';
  END IF;
  NEW.viewed_at := NULL;
  IF NEW.type = 'text' THEN
    NEW.media_path := NULL;
    NEW.duration_seconds := NULL;
    NEW.is_view_once := false;
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
      NEW.content := CASE WHEN NEW.is_view_once THEN '[view-once voice]' ELSE '[voice message]' END;
    ELSE
      NEW.duration_seconds := NULL;
      NEW.is_view_once := true;
      NEW.content := '[view-once image]';
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid message type';
  END IF;
  SELECT count(*) INTO v_recent FROM public.messages
   WHERE sender_id = NEW.sender_id AND created_at > now() - interval '10 seconds';
  IF v_recent >= 15 THEN RAISE EXCEPTION 'Slow down a little'; END IF;
  RETURN NEW;
END; $function$;

-- The single authorized open now covers both image and view-once voice messages.
CREATE OR REPLACE FUNCTION public.open_view_once(p_message uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_path text;
BEGIN
  UPDATE public.messages m SET viewed_at = now()
   WHERE m.id = p_message AND m.type IN ('image','voice') AND m.viewed_at IS NULL
     AND m.sender_id <> auth.uid()
     AND public.is_session_participant(m.session_id, auth.uid())
  RETURNING m.media_path INTO v_path;
  RETURN v_path;
END; $function$;

-- Read access: ordinary voice stays open to both participants; view-once voice
-- is only readable by the recipient within 5 minutes of their single open.
CREATE OR REPLACE FUNCTION public.can_read_chat_media(p_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE parts text[] := string_to_array(p_name, '/'); v_session uuid;
BEGIN
  IF array_length(parts, 1) <> 4 THEN RETURN false; END IF;
  BEGIN v_session := parts[1]::uuid; EXCEPTION WHEN others THEN RETURN false; END;
  IF NOT public.is_session_participant(v_session, auth.uid()) THEN RETURN false; END IF;
  IF parts[3] = 'voice' THEN
    IF NOT EXISTS (SELECT 1 FROM public.messages m
      WHERE m.media_path = p_name AND m.type = 'voice' AND m.is_view_once) THEN
      RETURN true;
    END IF;
    RETURN EXISTS (SELECT 1 FROM public.messages m
      WHERE m.media_path = p_name AND m.type = 'voice' AND m.is_view_once
        AND m.sender_id <> auth.uid()
        AND m.viewed_at IS NOT NULL
        AND m.viewed_at > now() - interval '300 seconds');
  END IF;
  IF parts[3] = 'image' THEN
    -- only the recipient, only within 60 seconds of their single authorized open
    RETURN EXISTS (SELECT 1 FROM public.messages m
      WHERE m.media_path = p_name AND m.type = 'image' AND m.sender_id <> auth.uid()
        AND m.viewed_at IS NOT NULL AND m.viewed_at > now() - interval '60 seconds');
  END IF;
  RETURN false;
END; $function$;

-- The recipient may delete media after their single authorized open
-- (view-once images and view-once voice).
CREATE OR REPLACE FUNCTION public.can_delete_chat_media(p_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.messages m
    WHERE m.media_path = p_name AND m.viewed_at IS NOT NULL
      AND (m.type = 'image' OR (m.type = 'voice' AND m.is_view_once))
      AND public.is_session_participant(m.session_id, auth.uid()));
$function$;
