
REVOKE ALL ON FUNCTION public.is_session_participant(uuid, uuid) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_session_active(uuid) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_message() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.request_match(text, text[]) FROM public, anon;
REVOKE ALL ON FUNCTION public.leave_queue() FROM public, anon;
REVOKE ALL ON FUNCTION public.end_chat_session(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.request_match(text, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_queue() TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_chat_session(uuid) TO authenticated;
