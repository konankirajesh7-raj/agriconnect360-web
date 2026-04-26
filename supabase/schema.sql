-- ═══════════════════════════════════════════════════════════════════
-- AgriConnect 360 — Complete Database Schema
-- All phases (11-13) unified schema
-- ═══════════════════════════════════════════════════════════════════

-- Phase 11: Farmer Profiles & Onboarding
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer','industrial','broker','supplier','labour','admin','fpo')),
  district TEXT DEFAULT 'Guntur',
  state TEXT DEFAULT 'Andhra Pradesh',
  village TEXT,
  mandal TEXT,
  land_area NUMERIC DEFAULT 0,
  land_unit TEXT DEFAULT 'acres',
  primary_crop TEXT,
  secondary_crops TEXT[],
  irrigation_type TEXT DEFAULT 'rain-fed',
  soil_type TEXT,
  aadhaar_last4 TEXT,
  bank_linked BOOLEAN DEFAULT false,
  kcc_number TEXT,
  onboarding_complete BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 11: FPO Management
CREATE TABLE IF NOT EXISTS fpo_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  registration_number TEXT UNIQUE,
  district TEXT,
  state TEXT DEFAULT 'Andhra Pradesh',
  member_count INT DEFAULT 0,
  chairperson TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  established_date DATE,
  crops TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','pending')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 12: Crop Tracking
CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  variety TEXT,
  field_name TEXT,
  area NUMERIC DEFAULT 0,
  area_unit TEXT DEFAULT 'acres',
  sowing_date DATE,
  expected_harvest DATE,
  status TEXT DEFAULT 'growing' CHECK (status IN ('planned','growing','harvested','sold')),
  estimated_yield NUMERIC,
  actual_yield NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 12: Expenses & Sales
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  crop_id UUID REFERENCES crops(id),
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT DEFAULT 'quintals',
  price_per_unit NUMERIC NOT NULL,
  total_amount NUMERIC GENERATED ALWAYS AS (quantity * price_per_unit) STORED,
  buyer_name TEXT,
  mandi TEXT,
  sale_date DATE DEFAULT CURRENT_DATE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','partial','received')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 12H: Financial Services
CREATE TABLE IF NOT EXISTS kcc_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  loan_amount NUMERIC,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected','disbursed')),
  interest_rate NUMERIC DEFAULT 4.0,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scheme TEXT NOT NULL DEFAULT 'PMFBY',
  crop_name TEXT,
  season TEXT,
  sum_insured NUMERIC,
  premium NUMERIC,
  subsidy NUMERIC,
  farmer_premium NUMERIC,
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled','claimed','settled','lapsed')),
  policy_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 12I: Gamification
CREATE TABLE IF NOT EXISTS gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  coins INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_logins INT DEFAULT 0,
  last_login DATE,
  earned_badges TEXT[] DEFAULT '{}',
  referral_code TEXT UNIQUE,
  total_referred INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 13: Marketplace
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT DEFAULT 'quintals',
  price_per_unit NUMERIC NOT NULL,
  grade TEXT DEFAULT 'A',
  organic BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','sold','expired')),
  posted_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 13: Community
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INT DEFAULT 0,
  helpful INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 13: IoT Sensors
CREATE TABLE IF NOT EXISTS iot_sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Soil','Weather','Water','Pest','Climate')),
  status TEXT DEFAULT 'online' CHECK (status IN ('online','offline','warning')),
  battery INT DEFAULT 100,
  last_reading JSONB,
  last_ping TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 13: Quality Lab
CREATE TABLE IF NOT EXISTS quality_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  sample_description TEXT,
  grade TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','rejected')),
  parameters JSONB,
  tested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 13: AgriTourism
CREATE TABLE IF NOT EXISTS agri_tourism_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('Farm Stay','Tour','Festival')),
  price NUMERIC NOT NULL,
  duration TEXT,
  max_guests INT DEFAULT 10,
  highlights TEXT[],
  rating NUMERIC DEFAULT 0,
  review_count INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own crops" ON crops FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Users can manage own crops" ON crops FOR ALL USING (auth.uid() = farmer_id);
CREATE POLICY "Users can view own expenses" ON expenses FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Users can manage own expenses" ON expenses FOR ALL USING (auth.uid() = farmer_id);
CREATE POLICY "Users can view own sales" ON sales FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Users can manage own sales" ON sales FOR ALL USING (auth.uid() = farmer_id);
CREATE POLICY "Users can view own gamification" ON gamification FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Users can update own gamification" ON gamification FOR ALL USING (auth.uid() = farmer_id);
CREATE POLICY "Anyone can view marketplace" ON marketplace_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own listings" ON marketplace_listings FOR ALL USING (auth.uid() = farmer_id);
CREATE POLICY "Anyone can view posts" ON community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crops_farmer ON crops(farmer_id);
CREATE INDEX IF NOT EXISTS idx_expenses_farmer ON expenses(farmer_id);
CREATE INDEX IF NOT EXISTS idx_sales_farmer ON sales(farmer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_community_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gamification_farmer ON gamification(farmer_id);
