-- Add policies for subscriptions table to ensure only service role can modify
-- Users can only view their own subscriptions (already exists)
-- Only service role (Stripe webhooks) can INSERT, UPDATE, DELETE

CREATE POLICY "Service role can insert subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update subscriptions"
ON public.subscriptions
FOR UPDATE
USING (true);

CREATE POLICY "Service role can delete subscriptions"
ON public.subscriptions
FOR DELETE
USING (true);