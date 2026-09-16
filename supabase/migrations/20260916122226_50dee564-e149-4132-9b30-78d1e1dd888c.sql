GRANT EXECUTE ON FUNCTION public.is_session_participant(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_session_active(uuid) TO authenticated, anon;