-- Member Private Messaging and Platinum Gifting
-- Creates the messaging table and updates profiles for membership expiration.

-- Update profiles with membership expiration
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ;
END $$;

-- Private messages table
CREATE TABLE IF NOT EXISTS public.private_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.private_messages TO authenticated;
GRANT ALL ON public.private_messages TO service_role;

ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own messages"
  ON public.private_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.private_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read"
  ON public.private_messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE INDEX IF NOT EXISTS idx_private_messages_receiver ON public.private_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_sender ON public.private_messages(sender_id);

-- Admin gift platinum RPC
CREATE OR REPLACE FUNCTION public.admin_gift_platinum(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Update user tier and expiry
  UPDATE public.profiles
  SET 
    membership_tier = 'platinum',
    membership_expires_at = now() + interval '1 month',
    updated_at = now()
  WHERE id = _user_id;

  -- Get admin's profile id (or use a system account)
  admin_id := auth.uid();

  -- Send private message
  INSERT INTO public.private_messages (sender_id, receiver_id, body)
  VALUES (
    admin_id,
    _user_id,
    'Congratulations! I have awarded you 1 month of free Platinum membership. You now have full access to all premium features, including advanced prompts, higher upload quotas, and priority support. We would love it if you could share Paste Prompts on social media—it helps the platform grow, brings in more talented creators, and ultimately enables you to make more sales! Enjoy your Platinum status.'
  );

  -- Enqueue email (if the email infra exists)
  -- Note: We use the existing transactional_emails queue
  PERFORM public.enqueue_email('transactional_emails', jsonb_build_object(
    'to', (SELECT email FROM auth.users WHERE id = _user_id),
    'from', 'benjamin@pasteprompts.co.uk',
    'subject', 'Congratulations on your Free Platinum Month!',
    'html', '<div style="font-family: sans-serif; line-height: 1.6; color: #333;">' ||
            '<h2>You''ve been awarded 1 month of Free Platinum Membership!</h2>' ||
            '<p>Hi there,</p>' ||
            '<p>I''ve just upgraded your account to <strong>Platinum</strong> for the next month as a gift for being part of our community.</p>' ||
            '<h3>What you get with Platinum:</h3>' ||
            '<ul>' ||
            '<li><strong>Full Library Access:</strong> Use any prompt in the library without restrictions.</li>' ||
            '<li><strong>Higher Quotas:</strong> Upload more prompts every month to build your creator profile.</li>' ||
            '<li><strong>Priority Support:</strong> Get help faster if you ever need it.</li>' ||
            '</ul>' ||
            '<p><strong>Why this benefits you:</strong> By having Platinum status, you can learn from the best prompts on the platform to improve your own creations.</p>' ||
            '<p><strong>Grow with us:</strong> It would be amazing if you could share Paste Prompts on social media. More eyes on the platform means more sales for you and more talented creators joining our library, making the community even stronger.</p>' ||
            '<p>Enjoy your new benefits!</p>' ||
            '<p>Best,<br>Benjamin<br>Paste Prompts</p>' ||
            '</div>',
    'label', 'membership_gift'
  ));

END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_gift_platinum(UUID) TO authenticated;
