-- Add policy to allow admins to delete any shift
CREATE POLICY "Admins can delete any shifts"
ON public.shifts
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));