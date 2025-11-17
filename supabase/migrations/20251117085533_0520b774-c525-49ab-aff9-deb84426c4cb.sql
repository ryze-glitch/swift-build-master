-- Create auth_logs table for tracking login/logout events
CREATE TABLE public.auth_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  discord_tag text,
  event_type text NOT NULL CHECK (event_type IN ('login', 'logout')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all logs
CREATE POLICY "Admins can view all auth logs"
ON public.auth_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Policy: Users can insert their own logs
CREATE POLICY "Users can insert own auth logs"
ON public.auth_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_auth_logs_created_at ON public.auth_logs(created_at DESC);
CREATE INDEX idx_auth_logs_user_id ON public.auth_logs(user_id);