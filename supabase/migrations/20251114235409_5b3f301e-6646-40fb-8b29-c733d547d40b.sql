-- Aggiungi campo per tracciare chi ha confermato la presa visione
ALTER TABLE public.shifts 
ADD COLUMN IF NOT EXISTS acknowledged_by jsonb DEFAULT '[]'::jsonb;

-- Aggiungi campo per tracciare quando è stata data la presa visione
ALTER TABLE public.shifts 
ADD COLUMN IF NOT EXISTS acknowledged_at timestamp with time zone;