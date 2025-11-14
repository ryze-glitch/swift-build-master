-- Allow users to delete their own announcements
CREATE POLICY "Users can delete own announcements" 
ON public.announcements 
FOR DELETE 
USING (auth.uid() = created_by);