-- ═══════════════════════════════════════════════════════════════
-- AgriConnect 360 — Comprehensive RLS Policies
-- Run this in Supabase SQL Editor AFTER the base migration
-- ═══════════════════════════════════════════════════════════════

-- ── Community Posts ──
ALTER TABLE IF EXISTS community_posts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Anyone can read posts" ON community_posts FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users create own posts" ON community_posts FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users delete own posts" ON community_posts FOR DELETE USING (auth.uid()::text = user_id::text OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Marketplace Listings ──
ALTER TABLE IF EXISTS marketplace_listings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Anyone can read listings" ON marketplace_listings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users create own listings" ON marketplace_listings FOR INSERT WITH CHECK (auth.uid()::text = farmer_id::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users update own listings" ON marketplace_listings FOR UPDATE USING (auth.uid()::text = farmer_id::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Disputes ──
ALTER TABLE IF EXISTS disputes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users read own disputes" ON disputes FOR SELECT USING (auth.uid()::text = reporter_id::text OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users create disputes" ON disputes FOR INSERT WITH CHECK (auth.uid()::text = reporter_id::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Profiles ──
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Background Photos (Ads) ──
ALTER TABLE IF EXISTS background_photos ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Approved ads visible to all" ON background_photos FOR SELECT USING (status IN ('approved', 'featured') OR auth.uid()::text = uploader_id::text OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users upload own ads" ON background_photos FOR INSERT WITH CHECK (auth.uid()::text = uploader_id::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Subscription Plans (admin-only write) ──
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS subscription_plans (
    role TEXT PRIMARY KEY,
    price NUMERIC DEFAULT 0,
    trial_days INTEGER DEFAULT 180,
    free_forever BOOLEAN DEFAULT false,
    billing TEXT DEFAULT '6 months',
    updated_at TIMESTAMPTZ DEFAULT now()
  );
EXCEPTION WHEN duplicate_table THEN NULL; END $$;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Anyone reads plans" ON subscription_plans FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admin writes plans" ON subscription_plans FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Payment Config (admin-editable) ──
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS payment_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    upi_id TEXT DEFAULT '6303369360@mbk',
    phone TEXT DEFAULT '6303369360',
    merchant_name TEXT DEFAULT 'AgriConnect 360',
    updated_at TIMESTAMPTZ DEFAULT now()
  );
EXCEPTION WHEN duplicate_table THEN NULL; END $$;
ALTER TABLE payment_config ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Anyone reads config" ON payment_config FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admin writes config" ON payment_config FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Insert default payment config
INSERT INTO payment_config (id, upi_id, phone, merchant_name) VALUES ('default', '6303369360@mbk', '6303369360', 'AgriConnect 360') ON CONFLICT (id) DO NOTHING;
