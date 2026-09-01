
-- ============ TABLES ============
CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL,
  user_b uuid NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','ended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);
CREATE INDEX idx_chat_sessions_user_a ON public.chat_sessions(user_a) WHERE status = 'active';
CREATE INDEX idx_chat_sessions_user_b ON public.chat_sessions(user_b) WHERE status = 'active';

CREATE TABLE public.chat_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  matching_mode text NOT NULL DEFAULT 'random' CHECK (matching_mode IN ('interests','random')),
  interests text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','matched')),
  session_id uuid REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_queue_waiting ON public.chat_queue(status, last_seen_at);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'text' CHECK (type = 'text'),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_session ON public.messages(session_id, created_at);

-- ============ GRANTS ============
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_queue TO authenticated;
GRANT ALL ON public.chat_queue TO service_role;
GRANT SELECT, UPDATE ON public.chat_sessions TO authenticated;
GRANT ALL ON public.chat_sessions TO service_role;
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

-- ============ HELPERS ============
CREATE OR REPLACE FUNCTION public.is_session_participant(p_session uuid, p_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_sessions s
    WHERE s.id = p_session AND (s.user_a = p_user OR s.user_b = p_user)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_session_active(p_session uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = p_session AND s.status = 'active');
$$;

-- ============ RLS ============
ALTER TABLE public.chat_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "queue_own_select" ON public.chat_queue FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "queue_own_insert" ON public.chat_queue FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "queue_own_update" ON public.chat_queue FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "queue_own_delete" ON public.chat_queue FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "sessions_participant_select" ON public.chat_sessions FOR SELECT TO authenticated
  USING (user_a = auth.uid() OR user_b = auth.uid());
CREATE POLICY "sessions_participant_end" ON public.chat_sessions FOR UPDATE TO authenticated
  USING (user_a = auth.uid() OR user_b = auth.uid())
  WITH CHECK (user_a = auth.uid() OR user_b = auth.uid());

CREATE POLICY "messages_participant_select" ON public.messages FOR SELECT TO authenticated
  USING (public.is_session_participant(session_id, auth.uid()));
CREATE POLICY "messages_send_as_self" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND type = 'text'
    AND public.is_session_participant(session_id, auth.uid())
    AND public.is_session_active(session_id)
  );

-- ============ MESSAGE VALIDATION + RATE LIMIT ============
CREATE OR REPLACE FUNCTION public.validate_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_recent int;
BEGIN
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
$$;
CREATE TRIGGER trg_validate_message BEFORE INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.validate_message();

-- ============ MATCHMAKING ============
CREATE OR REPLACE FUNCTION public.request_match(p_mode text, p_interests text[])
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
  v_mode text := CASE WHEN p_mode = 'interests' THEN 'interests' ELSE 'random' END;
  v_interests text[];
  v_session uuid;
  v_partner uuid;
  v_self record;
  v_recent_sessions int;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT coalesce(array_agg(DISTINCT lower(btrim(i))) FILTER (WHERE btrim(i) <> ''), '{}')
    INTO v_interests
  FROM unnest(coalesce(p_interests, '{}'::text[])) WITH ORDINALITY t(i, ord)
  WHERE ord <= 5;

  -- drop stale waiting entries (no heartbeat for 45s)
  DELETE FROM public.chat_queue
   WHERE status = 'waiting' AND last_seen_at < now() - interval '45 seconds';

  -- already in an active chat?
  SELECT id INTO v_session FROM public.chat_sessions
   WHERE status = 'active' AND (user_a = v_user OR user_b = v_user)
   ORDER BY created_at DESC LIMIT 1;
  IF v_session IS NOT NULL THEN
    DELETE FROM public.chat_queue WHERE user_id = v_user;
    RETURN v_session;
  END IF;

  -- abuse guard: too many new chats in a short window
  SELECT count(*) INTO v_recent_sessions FROM public.chat_sessions
   WHERE (user_a = v_user OR user_b = v_user) AND created_at > now() - interval '1 minute';
  IF v_recent_sessions >= 20 THEN
    RAISE EXCEPTION 'Too many matching requests. Please wait a moment.';
  END IF;

  -- upsert own queue entry (also acts as heartbeat)
  INSERT INTO public.chat_queue (user_id, matching_mode, interests, status, last_seen_at)
  VALUES (v_user, v_mode, v_interests, 'waiting', now())
  ON CONFLICT (user_id) DO UPDATE
    SET matching_mode = excluded.matching_mode,
        interests = excluded.interests,
        status = 'waiting',
        session_id = NULL,
        last_seen_at = now();

  -- lock own row first: prevents two users pairing each other simultaneously
  SELECT * INTO v_self FROM public.chat_queue WHERE user_id = v_user FOR UPDATE;
  IF v_self.status = 'matched' AND v_self.session_id IS NOT NULL THEN
    RETURN v_self.session_id;
  END IF;

  -- interest-first search
  IF v_mode = 'interests' AND coalesce(array_length(v_interests, 1), 0) > 0 THEN
    SELECT q.user_id INTO v_partner
    FROM public.chat_queue q
    WHERE q.user_id <> v_user
      AND q.status = 'waiting'
      AND q.last_seen_at > now() - interval '45 seconds'
      AND q.interests && v_interests
      AND NOT EXISTS (
        SELECT 1 FROM public.chat_sessions s
        WHERE s.status = 'active' AND (s.user_a = q.user_id OR s.user_b = q.user_id))
    ORDER BY cardinality(ARRAY(SELECT unnest(q.interests) INTERSECT SELECT unnest(v_interests))) DESC,
             q.created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1;
  END IF;

  -- broaden: random mode, or interest search that waited long enough
  IF v_partner IS NULL
     AND (v_mode = 'random' OR v_self.created_at < now() - interval '10 seconds') THEN
    SELECT q.user_id INTO v_partner
    FROM public.chat_queue q
    WHERE q.user_id <> v_user
      AND q.status = 'waiting'
      AND q.last_seen_at > now() - interval '45 seconds'
      AND (q.matching_mode = 'random' OR q.created_at < now() - interval '10 seconds'
           OR q.interests && v_interests)
      AND NOT EXISTS (
        SELECT 1 FROM public.chat_sessions s
        WHERE s.status = 'active' AND (s.user_a = q.user_id OR s.user_b = q.user_id))
    ORDER BY q.created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1;
  END IF;

  IF v_partner IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.chat_sessions (user_a, user_b) VALUES (v_user, v_partner)
  RETURNING id INTO v_session;

  UPDATE public.chat_queue
     SET status = 'matched', session_id = v_session, last_seen_at = now()
   WHERE user_id IN (v_user, v_partner);

  RETURN v_session;
END;
$$;

CREATE OR REPLACE FUNCTION public.leave_queue()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.chat_queue WHERE user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.end_chat_session(p_session uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.chat_sessions
     SET status = 'ended', ended_at = now()
   WHERE id = p_session AND status = 'active'
     AND (user_a = auth.uid() OR user_b = auth.uid());
  DELETE FROM public.chat_queue WHERE user_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.request_match(text, text[]) FROM public;
REVOKE ALL ON FUNCTION public.leave_queue() FROM public;
REVOKE ALL ON FUNCTION public.end_chat_session(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.request_match(text, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_queue() TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_chat_session(uuid) TO authenticated;

-- ============ REALTIME ============
ALTER TABLE public.chat_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
