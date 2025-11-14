-- Create shifts table
CREATE TABLE public.shifts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  role text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  assigned_personnel jsonb DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Policies for shifts
CREATE POLICY "Users can view all shifts"
ON public.shifts
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create shifts"
ON public.shifts
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own shifts"
ON public.shifts
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own shifts"
ON public.shifts
FOR DELETE
USING (auth.uid() = created_by);

-- Trigger for updated_at
CREATE TRIGGER update_shifts_updated_at
BEFORE UPDATE ON public.shifts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.shifts;