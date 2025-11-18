-- Add rejection fields to shifts table
ALTER TABLE public.shifts
ADD COLUMN IF NOT EXISTS rejected_by jsonb,
ADD COLUMN IF NOT EXISTS rejected_at timestamp with time zone;