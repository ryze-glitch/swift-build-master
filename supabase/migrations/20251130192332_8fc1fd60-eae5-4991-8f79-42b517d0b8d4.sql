-- Create function to acknowledge announcements (bypasses RLS like training votes)
CREATE OR REPLACE FUNCTION public.acknowledge_announcement(
  _announcement_id uuid,
  _user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_acknowledged jsonb;
  user_id_text text;
BEGIN
  user_id_text := _user_id::text;
  
  -- Get current acknowledged_by
  SELECT acknowledged_by INTO current_acknowledged
  FROM announcements
  WHERE id = _announcement_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Announcement not found';
  END IF;

  -- Initialize if null
  IF current_acknowledged IS NULL THEN
    current_acknowledged := '[]'::jsonb;
  END IF;

  -- Check if user already acknowledged
  IF current_acknowledged ? user_id_text THEN
    RETURN; -- Already acknowledged, do nothing
  END IF;

  -- Add user to acknowledged list
  UPDATE announcements
  SET acknowledged_by = current_acknowledged || to_jsonb(user_id_text),
      updated_at = now()
  WHERE id = _announcement_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.acknowledge_announcement(uuid, uuid) TO authenticated;