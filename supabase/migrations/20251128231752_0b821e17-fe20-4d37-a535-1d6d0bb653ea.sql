-- Drop the old policy that uses user_id
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;

-- Create a security definer function to get user's discord_id
CREATE OR REPLACE FUNCTION public.get_user_discord_id(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT discord_id
  FROM public.profiles
  WHERE id = _user_id
$$;

-- Create new policy that matches discord_id from profile
CREATE POLICY "Users can view own role by discord_id"
ON public.user_roles
FOR SELECT
TO authenticated
USING (discord_id = public.get_user_discord_id(auth.uid()));