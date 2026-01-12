
-- Drop existing policy
DROP POLICY IF EXISTS "Questions viewable by trial or active subscribers" ON public.questions;

-- Create simpler policy for trial questions
CREATE POLICY "Trial questions viewable by everyone" 
ON public.questions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.mocks m
    WHERE m.id = mock_id AND m.is_trial = true
  )
);

-- Separate policy for paid questions
CREATE POLICY "Paid questions viewable by subscribers" 
ON public.questions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.purchases
    WHERE user_id = auth.uid() AND status = 'active'
  )
);
