-- Create a function to allow authenticated users to vote on training announcements
CREATE OR REPLACE FUNCTION public.vote_training_announcement(
  _announcement_id uuid,
  _discord_tag text,
  _vote_choice text -- 'presenza', 'assenza', or 'remove'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_votes jsonb;
  new_presenza jsonb;
  new_assenza jsonb;
BEGIN
  -- Get current votes
  SELECT training_votes INTO current_votes
  FROM announcements
  WHERE id = _announcement_id AND type = 'training';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Announcement not found or not a training announcement';
  END IF;

  -- Initialize if null
  IF current_votes IS NULL THEN
    current_votes := '{"presenza": [], "assenza": []}'::jsonb;
  END IF;

  -- Remove user from both arrays first
  new_presenza := (
    SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
    FROM jsonb_array_elements(COALESCE(current_votes->'presenza', '[]'::jsonb)) elem
    WHERE elem #>> '{}' != _discord_tag
  );
  
  new_assenza := (
    SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
    FROM jsonb_array_elements(COALESCE(current_votes->'assenza', '[]'::jsonb)) elem
    WHERE elem #>> '{}' != _discord_tag
  );

  -- Add to selected choice if not 'remove'
  IF _vote_choice = 'presenza' THEN
    new_presenza := new_presenza || to_jsonb(_discord_tag);
  ELSIF _vote_choice = 'assenza' THEN
    new_assenza := new_assenza || to_jsonb(_discord_tag);
  END IF;

  -- Update the announcement
  UPDATE announcements
  SET training_votes = jsonb_build_object('presenza', new_presenza, 'assenza', new_assenza),
      updated_at = now()
  WHERE id = _announcement_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.vote_training_announcement(uuid, text, text) TO authenticated;