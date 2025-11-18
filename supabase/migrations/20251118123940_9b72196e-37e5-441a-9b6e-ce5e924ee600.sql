-- Allow admins to update any shift (e.g. for rejection / management actions)
CREATE POLICY "Admins can update any shifts"
ON public.shifts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));
