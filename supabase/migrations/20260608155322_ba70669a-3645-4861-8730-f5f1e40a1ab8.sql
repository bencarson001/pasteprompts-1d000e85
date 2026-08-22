-- ============ Storefront + referral columns ============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS twitter_handle text,
  ADD COLUMN IF NOT EXISTS referral_code text;

UPDATE public.profiles SET referral_code = encode(gen_random_bytes(4), 'hex') WHERE referral_code IS NULL;
ALTER TABLE public.profiles ALTER COLUMN referral_code SET DEFAULT encode(gen_random_bytes(4), 'hex');
CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_key ON public.profiles(referral_code);

ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;

-- ============ Collections (bundles) ============
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  cover text,
  price_pence integer NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'approved',
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT SELECT ON public.collections TO anon;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved collections are public" ON public.collections FOR SELECT USING (status = 'approved' OR creator_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Creators manage own collections" ON public.collections FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creators update own collections" ON public.collections FOR UPDATE USING (creator_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Creators delete own collections" ON public.collections FOR DELETE USING (creator_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER touch_collections BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  prompt_id uuid NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (collection_id, prompt_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collection_items TO authenticated;
GRANT SELECT ON public.collection_items TO anon;
GRANT ALL ON public.collection_items TO service_role;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collection items follow parent visibility" ON public.collection_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND (c.status = 'approved' OR c.creator_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "Owner manages collection items" ON public.collection_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND (c.creator_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND (c.creator_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);

-- ============ Follows ============
CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, creator_id)
);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT SELECT ON public.follows TO anon;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows are public" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users create own follows" ON public.follows FOR INSERT WITH CHECK (follower_id = auth.uid());
CREATE POLICY "Users delete own follows" ON public.follows FOR DELETE USING (follower_id = auth.uid());

-- ============ Notifications ============
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE USING (user_id = auth.uid());
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);

-- ============ Referrals ============
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reward_pence integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Referrers read own referrals" ON public.referrals FOR SELECT USING (referrer_id = auth.uid());
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);

-- ============ Prompt versions ============
CREATE TABLE public.prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  version integer NOT NULL,
  body text NOT NULL,
  changelog text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.prompt_versions TO authenticated;
GRANT ALL ON public.prompt_versions TO service_role;
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creator/admin read version bodies" ON public.prompt_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND (p.creator_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "Creator inserts versions" ON public.prompt_versions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND p.creator_id = auth.uid())
);
CREATE INDEX idx_prompt_versions_prompt ON public.prompt_versions(prompt_id, version DESC);

CREATE OR REPLACE FUNCTION public.get_prompt_changelog(_prompt_id uuid)
RETURNS TABLE (version integer, changelog text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.version, v.changelog, v.created_at
  FROM public.prompt_versions v
  WHERE v.prompt_id = _prompt_id
  ORDER BY v.version DESC
$$;

-- ============ Output showcases + votes ============
CREATE TABLE public.output_showcases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  image_url text,
  upvotes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.output_showcases TO authenticated;
GRANT SELECT ON public.output_showcases TO anon;
GRANT ALL ON public.output_showcases TO service_role;
ALTER TABLE public.output_showcases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Showcases are public" ON public.output_showcases FOR SELECT USING (true);
CREATE POLICY "Users create own showcases" ON public.output_showcases FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own showcases" ON public.output_showcases FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users delete own showcases" ON public.output_showcases FOR DELETE USING (user_id = auth.uid());
CREATE INDEX idx_showcases_prompt ON public.output_showcases(prompt_id, upvotes DESC);

CREATE TABLE public.showcase_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  showcase_id uuid NOT NULL REFERENCES public.output_showcases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (showcase_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.showcase_votes TO authenticated;
GRANT ALL ON public.showcase_votes TO service_role;
ALTER TABLE public.showcase_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes are public" ON public.showcase_votes FOR SELECT USING (true);
CREATE POLICY "Users create own votes" ON public.showcase_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own votes" ON public.showcase_votes FOR DELETE USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.sync_showcase_votes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE sid uuid;
BEGIN
  sid := COALESCE(NEW.showcase_id, OLD.showcase_id);
  UPDATE public.output_showcases SET upvotes = (SELECT COUNT(*) FROM public.showcase_votes WHERE showcase_id = sid) WHERE id = sid;
  RETURN NULL;
END $$;
CREATE TRIGGER sync_showcase_votes_trigger AFTER INSERT OR DELETE ON public.showcase_votes FOR EACH ROW EXECUTE FUNCTION public.sync_showcase_votes();