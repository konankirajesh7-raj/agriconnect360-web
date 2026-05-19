-- ============================================================================
-- AgriConnect 360 — Migration: Production Fixes
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ─── 1. payment_config (missing table — PaymentPage & AdminPaymentsPage depend on this) ──
CREATE TABLE IF NOT EXISTS public.payment_config (
  id            TEXT PRIMARY KEY DEFAULT 'default',
  upi_id        TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  merchant_name TEXT DEFAULT 'RythuSphere',
  coupon_code   TEXT DEFAULT 'AGRI360FREE',
  trial_days    INTEGER DEFAULT 180,
  farmer_price  NUMERIC DEFAULT 50,
  others_price  NUMERIC DEFAULT 100,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.payment_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cfg_public_read" ON public.payment_config FOR SELECT USING (true);
CREATE POLICY "cfg_admin_write" ON public.payment_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
-- Insert default row (update values via Admin Dashboard)
INSERT INTO public.payment_config (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- ─── 2. Atomic likes — prevents race condition on concurrent post likes ──────
CREATE OR REPLACE FUNCTION public.increment_post_likes(post_id bigint)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.community_posts
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = post_id;
$$;

-- ─── 3. notifications table (for real NotificationsPage data) ────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  icon        TEXT DEFAULT '🔔',
  title       TEXT NOT NULL,
  body        TEXT,
  type        TEXT DEFAULT 'info',  -- info | warning | success | error
  read        BOOLEAN DEFAULT false,
  link        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_read_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notif_admin_insert" ON public.notifications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  OR auth.uid() = user_id
);
CREATE INDEX IF NOT EXISTS notif_user_unread ON public.notifications (user_id, read, created_at DESC);

-- ─── 4. subscription_payments — ensure payment_method column exists ───────────
ALTER TABLE public.subscription_payments
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'upi',
  ADD COLUMN IF NOT EXISTS user_role TEXT;

-- ─── 5. cold_storage table (ColdStoragePage had no matching table) ────────────
CREATE TABLE IF NOT EXISTS public.cold_storage (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  location      TEXT,
  district      TEXT DEFAULT 'Guntur',
  capacity_tons NUMERIC DEFAULT 0,
  available_tons NUMERIC DEFAULT 0,
  rate_per_ton  NUMERIC DEFAULT 0,
  phone         TEXT,
  rating        NUMERIC(3,1) DEFAULT 4.0,
  facilities    JSONB DEFAULT '[]'::jsonb,
  user_id       UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.cold_storage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cold_storage_read" ON public.cold_storage FOR SELECT USING (true);
CREATE POLICY "cold_storage_write" ON public.cold_storage FOR INSERT WITH CHECK (auth.uid() = user_id);
