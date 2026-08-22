
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.prompt_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
CREATE TYPE public.ai_model AS ENUM ('chatgpt', 'claude', 'gemini', 'midjourney', 'sora', 'dalle', 'other');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  is_creator BOOLEAN NOT NULL DEFAULT false,
  stripe_account_id TEXT,
  total_sales INTEGER NOT NULL DEFAULT 0,
  total_earnings_pence INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security-definer function (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ============ PROMPTS ============
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  body TEXT NOT NULL,
  example_output TEXT NOT NULL,
  model public.ai_model NOT NULL DEFAULT 'chatgpt',
  tags TEXT[] NOT NULL DEFAULT '{}',
  price_pence INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  status public.prompt_status NOT NULL DEFAULT 'pending',
  featured BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  sales_count INTEGER NOT NULL DEFAULT 0,
  copies_count INTEGER NOT NULL DEFAULT 0,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  trending_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
CREATE INDEX prompts_category_idx ON public.prompts(category_id);
CREATE INDEX prompts_creator_idx ON public.prompts(creator_id);
CREATE INDEX prompts_status_idx ON public.prompts(status);
CREATE INDEX prompts_trending_idx ON public.prompts(trending_score DESC);

-- ============ PURCHASES ============
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  amount_pence INTEGER NOT NULL,
  platform_fee_pence INTEGER NOT NULL DEFAULT 0,
  creator_earning_pence INTEGER NOT NULL DEFAULT 0,
  stripe_session_id TEXT,
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (buyer_id, prompt_id)
);
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE INDEX purchases_buyer_idx ON public.purchases(buyer_id);

-- ============ SAVED ============
CREATE TABLE public.saved_prompts (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, prompt_id)
);
ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (prompt_id, buyer_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ============ SETTINGS ============
CREATE TABLE public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  commission_percent INTEGER NOT NULL DEFAULT 20,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.settings (id) VALUES (1);

-- ============ HELPER FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.has_purchased(_user_id UUID, _prompt_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.purchases
    WHERE buyer_id = _user_id AND prompt_id = _prompt_id
  )
$$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER prompts_touch BEFORE UPDATE ON public.prompts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER reviews_touch BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- New signup -> profile + default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  base_handle TEXT;
  new_handle TEXT;
  suffix INT := 0;
BEGIN
  base_handle := lower(regexp_replace(
    coalesce(NEW.raw_user_meta_data->>'handle', split_part(NEW.email, '@', 1)),
    '[^a-z0-9_]', '', 'g'
  ));
  IF base_handle = '' OR base_handle IS NULL THEN base_handle := 'user'; END IF;
  new_handle := base_handle;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE handle = new_handle) LOOP
    suffix := suffix + 1;
    new_handle := base_handle || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (id, handle, display_name, avatar_url)
  VALUES (
    NEW.id,
    new_handle,
    coalesce(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', new_handle),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update prompt rating when reviews change
CREATE OR REPLACE FUNCTION public.recompute_prompt_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE pid UUID;
BEGIN
  pid := COALESCE(NEW.prompt_id, OLD.prompt_id);
  UPDATE public.prompts SET
    rating_avg = COALESCE((SELECT AVG(rating)::NUMERIC(3,2) FROM public.reviews WHERE prompt_id = pid), 0),
    rating_count = (SELECT COUNT(*) FROM public.reviews WHERE prompt_id = pid)
  WHERE id = pid;
  RETURN NULL;
END $$;
CREATE TRIGGER reviews_recompute AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.recompute_prompt_rating();

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins update any profile"
  ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users view own roles"
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles"
  ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- categories
CREATE POLICY "Categories viewable by everyone"
  ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories"
  ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- prompts: approved are public; creator/admin see their own
CREATE POLICY "Approved prompts viewable by everyone"
  ON public.prompts FOR SELECT USING (status = 'approved');
CREATE POLICY "Creators view their own prompts"
  ON public.prompts FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Admins view all prompts"
  ON public.prompts FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Creators insert own prompts"
  ON public.prompts FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators update own prompts"
  ON public.prompts FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Admins update any prompt"
  ON public.prompts FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Creators delete own prompts"
  ON public.prompts FOR DELETE USING (auth.uid() = creator_id);
CREATE POLICY "Admins delete any prompt"
  ON public.prompts FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- purchases
CREATE POLICY "Users view own purchases"
  ON public.purchases FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Creators view sales of their prompts"
  ON public.purchases FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND p.creator_id = auth.uid())
  );
CREATE POLICY "Admins view all purchases"
  ON public.purchases FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own free purchases"
  ON public.purchases FOR INSERT WITH CHECK (auth.uid() = buyer_id AND is_free = true);

-- saved
CREATE POLICY "Users view own saved"
  ON public.saved_prompts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own saved"
  ON public.saved_prompts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- reviews
CREATE POLICY "Reviews viewable by everyone"
  ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Buyers create review for purchased prompt"
  ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = buyer_id AND public.has_purchased(auth.uid(), prompt_id)
  );
CREATE POLICY "Buyers update own review"
  ON public.reviews FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "Buyers delete own review"
  ON public.reviews FOR DELETE USING (auth.uid() = buyer_id);
CREATE POLICY "Admins delete any review"
  ON public.reviews FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- settings
CREATE POLICY "Settings viewable by everyone"
  ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins update settings"
  ON public.settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- ============ SEED CATEGORIES ============
INSERT INTO public.categories (slug, name, description, icon, sort_order) VALUES
  ('make-money-online', 'Make Money Online', 'Battle-tested prompts for side hustles, freelancing, e-commerce and digital products.', 'banknote', 1),
  ('social-media', 'TikTok & YouTube Growth', 'Hooks, scripts and content systems that actually pop on short-form and long-form.', 'play', 2),
  ('business-marketing', 'Business & Marketing', 'Strategy, positioning, ads, funnels, email and growth playbooks.', 'briefcase', 3),
  ('copywriting', 'Copywriting', 'Sales pages, VSLs, landing copy, cold emails and DM scripts that convert.', 'pen-tool', 4),
  ('productivity', 'Productivity', 'Personal systems, planning, learning, decision-making and workflow automations.', 'zap', 5),
  ('ai-tools', 'AI Tools', 'Power-user prompts for ChatGPT, Claude, Midjourney, Gemini and Sora.', 'sparkles', 6);
