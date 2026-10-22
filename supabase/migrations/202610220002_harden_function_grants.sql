-- Forward fix for 202610220001_initial.sql.
-- Supabase default privileges grant EXECUTE on new functions to anon and authenticated
-- directly, so `revoke ... from public` in the initial migration does not remove them.

alter function public.set_updated_at() set search_path = '';

revoke execute on function public.is_admin() from anon;
revoke execute on function public.is_active_user() from anon;

-- Trigger functions are never called through the API; triggers keep firing without EXECUTE.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.validate_analytics_event() from public, anon, authenticated;
