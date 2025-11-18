-- Add rejected_reason column to shifts table
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS rejected_reason text;